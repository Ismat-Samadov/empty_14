"""
auto.ru scraper -- https://auto.ru/cars/all/
Strategy:
  1. Open a visible Chromium browser (non-headless) to bypass Yandex SmartCaptcha.
     Cookies are saved to data/cookies.json after the first successful solve,
     so you only need to interact with the captcha once.
  2. Intercept the main listing JSON API call the page makes (POST).
  3. Replay that API call for all pages via curl_cffi.

Requirements:
    pip install playwright curl_cffi
    playwright install chromium

Usage:
    python scripts/scraper.py
"""

import asyncio
import csv
import json
import sys
import time
from pathlib import Path

from curl_cffi.requests import AsyncSession
from playwright.async_api import async_playwright, Response, Request

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
BASE_URL      = "https://auto.ru"
LISTING_URL   = f"{BASE_URL}/cars/used/"   # used-only page loads listing directly (no new-car banner)
OUTPUT_PATH   = Path(__file__).parent.parent / "data" / "data.csv"
COOKIES_PATH  = Path(__file__).parent.parent / "data" / "cookies.json"

PAGE_SIZE     = 37       # auto.ru default
MAX_PAGES     = 99       # UI/API hard cap
CONCURRENCY   = 5
RETRY_LIMIT   = 3
RETRY_DELAY   = 3.0
CAPTCHA_WAIT  = 120      # seconds to wait after browser opens
IMPERSONATE   = "chrome120"

# Endpoint fragments to skip (not the main listing)
SKIP_FRAGMENTS = [
    "listingSpecial", "listing-special",
    "listingCarsNew",
    "Related", "similar", "cross-links",
    "breadcrumbs", "filters",
]

FIELDNAMES = [
    "id", "url", "name", "brand", "model", "generation",
    "year", "price_rub", "price_usd", "price_eur",
    "mileage_km", "color", "body_type",
    "engine_volume", "engine_power", "transmission",
    "drive", "fuel_type", "doors",
    "condition", "section",
    "region", "city",
    "seller_type", "with_nds",
    "description", "photos_count", "photo_url",
    "created_at", "expires_at",
]


# ---------------------------------------------------------------------------
# Cookie persistence
# ---------------------------------------------------------------------------

def load_cookies() -> dict | None:
    """Return saved cookies dict if the file is fresh (< 12 hours old)."""
    if not COOKIES_PATH.exists():
        return None
    age = time.time() - COOKIES_PATH.stat().st_mtime
    if age > 12 * 3600:
        print("Saved cookies are stale (>12 h), will re-authenticate.", flush=True)
        return None
    with open(COOKIES_PATH, encoding="utf-8") as f:
        return json.load(f)


def save_cookies(cookies: dict):
    COOKIES_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(COOKIES_PATH, "w", encoding="utf-8") as f:
        json.dump(cookies, f)
    print(f"  Cookies saved to {COOKIES_PATH}", flush=True)


# ---------------------------------------------------------------------------
# Step 1: browser session -- capture listing API
# ---------------------------------------------------------------------------

async def get_session_info():
    """
    Open auto.ru in a real browser, wait for the main listing API call,
    and return (api_base, method, post_data, safe_headers, cookies, first_body).
    """
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(
            headless=False,
            args=[
                "--lang=ru-RU",
                "--disable-blink-features=AutomationControlled",
                "--start-maximized",
            ],
        )
        context = await browser.new_context(
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/131.0.0.0 Safari/537.36"
            ),
            locale="ru-RU",
            extra_http_headers={"accept-language": "ru-RU,ru;q=0.9"},
            no_viewport=True,
        )
        await context.add_init_script(
            "Object.defineProperty(navigator, 'webdriver', {get: () => undefined});"
        )

        # Restore previously saved cookies if available
        saved = load_cookies()
        if saved:
            playwright_cookies = [
                {"name": k, "value": v, "domain": ".auto.ru", "path": "/"}
                for k, v in saved.items()
            ]
            await context.add_cookies(playwright_cookies)
            print("  Restored saved cookies.", flush=True)

        page = await context.new_page()
        api_event: asyncio.Future = asyncio.get_event_loop().create_future()
        captured: dict = {}

        async def on_response(response: Response):
            if api_event.done():
                return
            url = response.url
            ct  = response.headers.get("content-type", "")
            if "json" not in ct:
                return
            if any(frag in url for frag in SKIP_FRAGMENTS):
                return

            try:
                body = await response.json()
            except Exception:
                return

            if body.get("type") == "captcha":
                return

            has_offers = (
                isinstance(body.get("offers"), list) and len(body["offers"]) > 0
                or isinstance(body.get("listing"), dict)
                or (isinstance(body.get("data"), dict) and "offers" in body["data"])
            )
            if not has_offers:
                return

            req: Request = response.request
            captured["url"]     = url
            captured["method"]  = req.method
            captured["headers"] = dict(req.headers)
            captured["body"]    = body
            try:
                captured["post_data"] = req.post_data
            except Exception:
                captured["post_data"] = None

            api_event.set_result(True)
            print(f"  [browser] Listing API captured: {url}", flush=True)

        page.on("response", on_response)

        print("=" * 60, flush=True)
        print("Opening auto.ru in browser ...", flush=True)
        print("If a captcha appears -- click the 'I am not a robot' checkbox.", flush=True)
        print(f"Waiting up to {CAPTCHA_WAIT} seconds for listing to load ...", flush=True)
        print("=" * 60, flush=True)

        try:
            await page.goto(LISTING_URL, wait_until="domcontentloaded", timeout=30000)
        except Exception as e:
            print(f"  Navigation error: {e}", flush=True)

        try:
            await asyncio.wait_for(api_event, timeout=CAPTCHA_WAIT)
        except asyncio.TimeoutError:
            # Show all JSON calls for debugging
            all_json: list = []
            async def dbg(resp: Response):
                ct = resp.headers.get("content-type", "")
                if "json" in ct:
                    try:
                        b = await resp.json()
                        all_json.append((resp.url, list(b.keys()) if isinstance(b, dict) else type(b).__name__))
                    except Exception:
                        pass
            page.on("response", dbg)
            await page.wait_for_timeout(5000)

            print("\nTimeout. All JSON API calls seen:", flush=True)
            for u, k in all_json:
                print(f"  {u[:100]}  keys={k}", flush=True)
            await browser.close()
            sys.exit(1)

        raw_cookies = await context.cookies()
        cookies = {c["name"]: c["value"] for c in raw_cookies}
        await browser.close()

    save_cookies(cookies)

    api_base  = captured["url"].split("?")[0]
    method    = captured.get("method", "POST")
    post_data = captured.get("post_data")

    safe_headers = {
        k: v for k, v in captured["headers"].items()
        if k.lower() in {
            "accept", "accept-language", "content-type",
            "referer", "x-client-id", "x-csrf-token", "x-retpath-y",
        }
    }
    safe_headers.setdefault("accept", "application/json")

    return api_base, method, post_data, safe_headers, cookies, captured["body"]


# ---------------------------------------------------------------------------
# Flatten one offer -> CSV row
# ---------------------------------------------------------------------------

def flatten_offer(offer: dict) -> dict:
    row = {f: "" for f in FIELDNAMES}

    row["id"]  = offer.get("id", "")
    raw_url    = offer.get("url", "")
    row["url"] = (BASE_URL + raw_url) if str(raw_url).startswith("/") else raw_url

    vehicle  = offer.get("vehicle_info", {})
    mark     = vehicle.get("mark_info",  {})
    model_i  = vehicle.get("model_info", {})
    gen      = vehicle.get("super_gen",  {})
    tech     = vehicle.get("tech_param", {})
    conf     = vehicle.get("configuration", {})

    row["brand"]         = mark.get("name", "")
    row["model"]         = model_i.get("name", "")
    row["generation"]    = gen.get("name", "")
    row["year"]          = offer.get("documents", {}).get("year", "")
    row["body_type"]     = conf.get("body_type", "") or vehicle.get("body_type", "")
    row["engine_volume"] = tech.get("displacement", "") or tech.get("engine_volume", "")
    row["engine_power"]  = tech.get("power", "")
    row["transmission"]  = tech.get("transmission", "") or vehicle.get("transmission", "")
    row["drive"]         = tech.get("drive", "") or vehicle.get("drive", "")
    row["fuel_type"]     = tech.get("engine_type", "") or vehicle.get("engine_type", "")
    row["doors"]         = conf.get("doors_count", "")

    row["name"] = " ".join(
        str(p) for p in [row["brand"], row["model"], row["year"]] if p
    )

    price            = offer.get("price_info", {})
    row["price_rub"] = price.get("price", "") or price.get("RUR", "")
    row["price_usd"] = price.get("USD", "")
    row["price_eur"] = price.get("EUR", "")
    row["with_nds"]  = price.get("with_nds", "")

    state             = offer.get("state", {})
    row["mileage_km"] = state.get("mileage", "")
    row["color"]      = offer.get("color_hex", "") or offer.get("color", "")
    row["condition"]  = state.get("condition", "") or offer.get("condition", "")
    row["section"]    = offer.get("section", "")

    seller       = offer.get("seller", {})
    loc          = seller.get("location", {})
    row["region"]= loc.get("region_info",     {}).get("name", "")
    row["city"]  = loc.get("geobase_id_info", {}).get("name", "")

    row["seller_type"] = offer.get("seller_type", "")
    row["description"] = offer.get("description", "")

    photos              = offer.get("photo_urls", []) or state.get("image_urls", [])
    row["photos_count"] = len(photos) if isinstance(photos, list) else ""
    row["photo_url"]    = photos[0] if photos else ""

    add_info          = offer.get("additional_info", {})
    row["created_at"] = add_info.get("creation_date", "") or offer.get("created", "")
    row["expires_at"] = add_info.get("expire_date", "")

    return row


def extract_offers_and_pages(body: dict) -> tuple[list, int]:
    offers, total = [], 1

    if isinstance(body.get("offers"), list):
        offers = body["offers"]
        total  = body.get("pagination", {}).get("total_page_count", 1)
    elif isinstance(body.get("listing"), dict):
        lst    = body["listing"]
        offers = lst.get("offers", [])
        total  = lst.get("pagination", {}).get("total_page_count", 1)
    elif isinstance(body.get("data"), dict):
        d      = body["data"]
        offers = d.get("offers", [])
        total  = d.get("pagination", {}).get("total_page_count", 1)

    return offers, min(total, MAX_PAGES)


# ---------------------------------------------------------------------------
# Step 2: fetch all pages
# ---------------------------------------------------------------------------

async def fetch_page(session, api_base, method, post_data, headers, cookies, page_num, sem):
    async with sem:
        for attempt in range(1, RETRY_LIMIT + 1):
            try:
                if method.upper() == "POST":
                    body_dict = {}
                    if post_data:
                        try:
                            body_dict = json.loads(post_data)
                        except Exception:
                            pass
                    body_dict["page"]      = page_num
                    body_dict["page_size"] = PAGE_SIZE
                    r = await session.post(
                        api_base, json=body_dict,
                        headers=headers, cookies=cookies, timeout=30,
                    )
                else:
                    r = await session.get(
                        api_base,
                        params={"page": str(page_num), "page_size": str(PAGE_SIZE)},
                        headers=headers, cookies=cookies, timeout=30,
                    )

                if r.status_code == 200:
                    b = r.json()
                    if b.get("type") == "captcha":
                        print(f"  [page {page_num}] captcha response", flush=True)
                        return page_num, None
                    return page_num, b

                print(f"  [page {page_num}] HTTP {r.status_code} (attempt {attempt})", flush=True)
            except Exception as e:
                print(f"  [page {page_num}] {e} (attempt {attempt})", flush=True)

            if attempt < RETRY_LIMIT:
                await asyncio.sleep(RETRY_DELAY)

    return page_num, None


async def scrape_all(api_base, method, post_data, headers, cookies, first_body):
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)

    first_offers, total_pages = extract_offers_and_pages(first_body)
    print(f"Total pages : {total_pages}", flush=True)
    print(f"Page 1      : {len(first_offers)} offers", flush=True)

    all_rows = [flatten_offer(o) for o in first_offers]
    sem      = asyncio.Semaphore(CONCURRENCY)

    async with AsyncSession(impersonate=IMPERSONATE) as session:
        tasks = [
            fetch_page(session, api_base, method, post_data, headers, cookies, p, sem)
            for p in range(2, total_pages + 1)
        ]
        for coro in asyncio.as_completed(tasks):
            p, body = await coro
            if body is None:
                continue
            offers, _ = extract_offers_and_pages(body)
            all_rows.extend(flatten_offer(o) for o in offers)
            print(
                f"  page {p}/{total_pages} | {len(offers)} offers | total: {len(all_rows)}",
                flush=True,
            )

    print(f"\nWriting {len(all_rows)} rows to {OUTPUT_PATH}", flush=True)
    with open(OUTPUT_PATH, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=FIELDNAMES)
        writer.writeheader()
        writer.writerows(all_rows)
    print(f"Done. {len(all_rows)} records saved.", flush=True)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

async def main():
    print("Step 1 -- Open browser & capture session ...", flush=True)
    api_base, method, post_data, headers, cookies, first_body = await get_session_info()
    print(f"  api_base : {api_base}", flush=True)
    print(f"  method   : {method}", flush=True)
    print(f"  cookies  : {len(cookies)} captured", flush=True)

    print("\nStep 2 -- Scrape all pages ...", flush=True)
    await scrape_all(api_base, method, post_data, headers, cookies, first_body)


if __name__ == "__main__":
    asyncio.run(main())
