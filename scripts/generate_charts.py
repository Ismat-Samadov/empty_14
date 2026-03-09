"""
auto.ru -- Business Charts Generator
Reads data/data.csv and produces charts in charts/
"""

import csv
import os
from collections import defaultdict
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.ticker as mtick
import numpy as np

DATA_PATH   = Path(__file__).parent.parent / "data" / "data.csv"
CHARTS_PATH = Path(__file__).parent.parent / "charts"
CHARTS_PATH.mkdir(exist_ok=True)

# ── Colour palette ────────────────────────────────────────────────────────────
BLUE      = "#1F77B4"
ORANGE    = "#FF7F0E"
GREEN     = "#2CA02C"
RED       = "#D62728"
PURPLE    = "#9467BD"
BROWN     = "#8C564B"
PINK      = "#E377C2"
GREY      = "#7F7F7F"
YELLOW    = "#BCBD22"
TEAL      = "#17BECF"
PALETTE   = [BLUE, ORANGE, GREEN, RED, PURPLE, BROWN, PINK, GREY, YELLOW, TEAL]

FIG_W, FIG_H = 12, 6

FUEL_LABELS = {
    "GASOLINE": "Gasoline",
    "DIESEL":   "Diesel",
    "HYBRID":   "Hybrid",
    "ELECTRO":  "Electric",
    "LPG":      "LPG",
    "":         "Unknown",
}
TRANS_LABELS = {
    "AUTOMATIC":  "Automatic",
    "ROBOT":      "Robot",
    "MECHANICAL": "Manual",
    "VARIATOR":   "CVT",
    "":           "Unknown",
}
BODY_LABELS = {
    "ALLROAD_5_DOORS": "SUV / Crossover",
    "PICKUP_TWO":      "Pickup",
    "COUPE":           "Coupe",
    "SEDAN":           "Sedan",
    "HATCHBACK":       "Hatchback",
    "MINIVAN":         "Minivan",
    "LIFTBACK":        "Liftback",
    "WAGON":           "Wagon",
    "":                "Other",
}


def rub_m(v):
    """Format RUB value as millions label."""
    return f"{v/1_000_000:.1f}M"


def save(fig, name):
    path = CHARTS_PATH / name
    fig.tight_layout()
    fig.savefig(path, dpi=150, bbox_inches="tight")
    plt.close(fig)
    print(f"  Saved: {path.name}")


# ── Load data ─────────────────────────────────────────────────────────────────

def load_data():
    rows = []
    with open(DATA_PATH, encoding="utf-8-sig") as f:
        for r in csv.DictReader(f):
            try:
                r["_price"] = int(r["price_rub"]) if r["price_rub"].isdigit() else None
            except Exception:
                r["_price"] = None
            try:
                r["_power"] = int(r["engine_power"]) if r["engine_power"].isdigit() else None
            except Exception:
                r["_power"] = None
            rows.append(r)
    return rows


# ── Chart 1: Top brands by listing count ─────────────────────────────────────

def chart_brands_count(rows):
    counts = defaultdict(int)
    for r in rows:
        if r["brand"]:
            counts[r["brand"]] += 1
    top = sorted(counts.items(), key=lambda x: x[1], reverse=True)[:15]
    labels, vals = zip(*top)

    fig, ax = plt.subplots(figsize=(FIG_W, FIG_H))
    bars = ax.bar(labels, vals, color=PALETTE[:len(labels)])
    ax.set_title("Top Car Brands by Number of Listings", fontsize=15, fontweight="bold", pad=12)
    ax.set_xlabel("Brand", labelpad=8)
    ax.set_ylabel("Number of Listings")
    ax.bar_label(bars, fmt="%d", padding=3, fontsize=9)
    plt.xticks(rotation=30, ha="right")
    save(fig, "01_brands_count.png")


# ── Chart 2: Average price by brand ──────────────────────────────────────────

def chart_avg_price_by_brand(rows):
    brand_prices = defaultdict(list)
    for r in rows:
        if r["brand"] and r["_price"]:
            brand_prices[r["brand"]].append(r["_price"])
    avgs = {b: sum(v) / len(v) for b, v in brand_prices.items() if v}
    top = sorted(avgs.items(), key=lambda x: x[1], reverse=True)[:15]
    labels, vals = zip(*top)

    fig, ax = plt.subplots(figsize=(FIG_W, FIG_H))
    bars = ax.barh(list(reversed(labels)), [v / 1_000_000 for v in reversed(vals)],
                   color=PALETTE[:len(labels)])
    ax.set_title("Average Listing Price by Brand (RUB, millions)", fontsize=15, fontweight="bold", pad=12)
    ax.set_xlabel("Average Price (RUB millions)")
    ax.xaxis.set_major_formatter(mtick.FuncFormatter(lambda x, _: f"{x:.1f}M"))
    for bar, v in zip(bars, reversed(vals)):
        ax.text(bar.get_width() + 0.1, bar.get_y() + bar.get_height() / 2,
                f"{v/1_000_000:.1f}M", va="center", fontsize=9)
    save(fig, "02_avg_price_by_brand.png")


# ── Chart 3: Price range distribution ────────────────────────────────────────

def chart_price_distribution(rows):
    prices = [r["_price"] for r in rows if r["_price"]]
    buckets = [
        (0,          3_000_000,  "< 3M"),
        (3_000_000,  5_000_000,  "3-5M"),
        (5_000_000,  10_000_000, "5-10M"),
        (10_000_000, 20_000_000, "10-20M"),
        (20_000_000, 50_000_000, "20-50M"),
        (50_000_000, float("inf"), "50M+"),
    ]
    labels = [b[2] for b in buckets]
    counts = [sum(1 for p in prices if b[0] <= p < b[1]) for b in buckets]

    fig, ax = plt.subplots(figsize=(FIG_W, FIG_H))
    bars = ax.bar(labels, counts, color=BLUE)
    ax.set_title("Price Range Distribution of Listings", fontsize=15, fontweight="bold", pad=12)
    ax.set_xlabel("Price Range (RUB)")
    ax.set_ylabel("Number of Listings")
    ax.bar_label(bars, fmt="%d", padding=3)
    save(fig, "03_price_distribution.png")


# ── Chart 4: Body type distribution ──────────────────────────────────────────

def chart_body_types(rows):
    counts = defaultdict(int)
    for r in rows:
        label = BODY_LABELS.get(r["body_type"], r["body_type"] or "Other")
        counts[label] += 1
    top = sorted(counts.items(), key=lambda x: x[1], reverse=True)[:10]
    labels, vals = zip(*top)

    fig, ax = plt.subplots(figsize=(FIG_W, FIG_H))
    bars = ax.bar(labels, vals, color=PALETTE[:len(labels)])
    ax.set_title("Listings by Body Type", fontsize=15, fontweight="bold", pad=12)
    ax.set_xlabel("Body Type")
    ax.set_ylabel("Number of Listings")
    ax.bar_label(bars, fmt="%d", padding=3)
    plt.xticks(rotation=20, ha="right")
    save(fig, "04_body_types.png")


# ── Chart 5: Fuel type distribution ──────────────────────────────────────────

def chart_fuel_types(rows):
    counts = defaultdict(int)
    for r in rows:
        label = FUEL_LABELS.get(r["fuel_type"], r["fuel_type"] or "Unknown")
        counts[label] += 1
    top = sorted(counts.items(), key=lambda x: x[1], reverse=True)
    labels, vals = zip(*top)

    fig, ax = plt.subplots(figsize=(8, 5))
    bars = ax.bar(labels, vals, color=PALETTE[:len(labels)])
    ax.set_title("Listings by Fuel Type", fontsize=15, fontweight="bold", pad=12)
    ax.set_xlabel("Fuel Type")
    ax.set_ylabel("Number of Listings")
    ax.bar_label(bars, fmt="%d", padding=3)
    save(fig, "05_fuel_types.png")


# ── Chart 6: Transmission type distribution ───────────────────────────────────

def chart_transmission(rows):
    counts = defaultdict(int)
    for r in rows:
        label = TRANS_LABELS.get(r["transmission"], r["transmission"] or "Unknown")
        counts[label] += 1
    top = sorted(counts.items(), key=lambda x: x[1], reverse=True)
    labels, vals = zip(*top)

    fig, ax = plt.subplots(figsize=(8, 5))
    bars = ax.bar(labels, vals, color=PALETTE[:len(labels)])
    ax.set_title("Listings by Transmission Type", fontsize=15, fontweight="bold", pad=12)
    ax.set_xlabel("Transmission")
    ax.set_ylabel("Number of Listings")
    ax.bar_label(bars, fmt="%d", padding=3)
    save(fig, "06_transmission.png")


# ── Chart 7: Average price by fuel type ──────────────────────────────────────

def chart_price_by_fuel(rows):
    fuel_prices = defaultdict(list)
    for r in rows:
        if r["_price"] and r["fuel_type"]:
            label = FUEL_LABELS.get(r["fuel_type"], r["fuel_type"])
            fuel_prices[label].append(r["_price"])
    avgs = {k: sum(v) / len(v) for k, v in fuel_prices.items() if v}
    top = sorted(avgs.items(), key=lambda x: x[1], reverse=True)
    labels, vals = zip(*top)

    fig, ax = plt.subplots(figsize=(8, 5))
    bars = ax.bar(labels, [v / 1_000_000 for v in vals], color=PALETTE[:len(labels)])
    ax.set_title("Average Price by Fuel Type (RUB millions)", fontsize=15, fontweight="bold", pad=12)
    ax.set_xlabel("Fuel Type")
    ax.set_ylabel("Avg Price (RUB millions)")
    ax.yaxis.set_major_formatter(mtick.FuncFormatter(lambda x, _: f"{x:.1f}M"))
    ax.bar_label(bars, labels=[f"{v/1_000_000:.1f}M" for v in vals], padding=3)
    save(fig, "07_price_by_fuel.png")


# ── Chart 8: Price by transmission type ──────────────────────────────────────

def chart_price_by_transmission(rows):
    trans_prices = defaultdict(list)
    for r in rows:
        if r["_price"] and r["transmission"]:
            label = TRANS_LABELS.get(r["transmission"], r["transmission"])
            trans_prices[label].append(r["_price"])
    avgs = {k: sum(v) / len(v) for k, v in trans_prices.items() if v}
    top = sorted(avgs.items(), key=lambda x: x[1], reverse=True)
    labels, vals = zip(*top)

    fig, ax = plt.subplots(figsize=(8, 5))
    bars = ax.bar(labels, [v / 1_000_000 for v in vals], color=PALETTE[:len(labels)])
    ax.set_title("Average Price by Transmission Type (RUB millions)", fontsize=15, fontweight="bold", pad=12)
    ax.set_xlabel("Transmission Type")
    ax.set_ylabel("Avg Price (RUB millions)")
    ax.yaxis.set_major_formatter(mtick.FuncFormatter(lambda x, _: f"{x:.1f}M"))
    ax.bar_label(bars, labels=[f"{v/1_000_000:.1f}M" for v in vals], padding=3)
    save(fig, "08_price_by_transmission.png")


# ── Chart 9: Engine power brackets ───────────────────────────────────────────

def chart_engine_power(rows):
    buckets = [
        (0,   100, "< 100 hp"),
        (100, 150, "100-150"),
        (150, 200, "150-200"),
        (200, 300, "200-300"),
        (300, 500, "300-500"),
        (500, float("inf"), "500+ hp"),
    ]
    counts = [
        sum(1 for r in rows if r["_power"] and b[0] <= r["_power"] < b[1])
        for b in buckets
    ]
    labels = [b[2] for b in buckets]

    fig, ax = plt.subplots(figsize=(FIG_W, FIG_H))
    bars = ax.bar(labels, counts, color=GREEN)
    ax.set_title("Listings by Engine Power", fontsize=15, fontweight="bold", pad=12)
    ax.set_xlabel("Engine Power (hp)")
    ax.set_ylabel("Number of Listings")
    ax.bar_label(bars, fmt="%d", padding=3)
    save(fig, "09_engine_power.png")


# ── Chart 10: Model year distribution ────────────────────────────────────────

def chart_year_distribution(rows):
    counts = defaultdict(int)
    for r in rows:
        if r["year"]:
            counts[r["year"]] += 1
    years = sorted(counts.keys())
    vals  = [counts[y] for y in years]

    fig, ax = plt.subplots(figsize=(10, 5))
    bars = ax.bar(years, vals, color=PURPLE)
    ax.set_title("Listings by Model Year", fontsize=15, fontweight="bold", pad=12)
    ax.set_xlabel("Year")
    ax.set_ylabel("Number of Listings")
    ax.bar_label(bars, fmt="%d", padding=3)
    save(fig, "10_year_distribution.png")


# ── Chart 11: Stacked price segments by brand ────────────────────────────────

def chart_stacked_price_by_brand(rows):
    segments = ["< 5M", "5-10M", "10-20M", "20M+"]
    brand_data = defaultdict(lambda: defaultdict(int))
    for r in rows:
        if not r["brand"] or not r["_price"]:
            continue
        p = r["_price"]
        if p < 5_000_000:
            seg = "< 5M"
        elif p < 10_000_000:
            seg = "5-10M"
        elif p < 20_000_000:
            seg = "10-20M"
        else:
            seg = "20M+"
        brand_data[r["brand"]][seg] += 1

    # Top brands by total count
    brand_totals = {b: sum(d.values()) for b, d in brand_data.items()}
    top_brands   = [b for b, _ in sorted(brand_totals.items(), key=lambda x: x[1], reverse=True)[:10]]

    x     = np.arange(len(top_brands))
    width = 0.6
    bottoms = np.zeros(len(top_brands))

    fig, ax = plt.subplots(figsize=(FIG_W, FIG_H))
    for i, seg in enumerate(segments):
        vals = np.array([brand_data[b].get(seg, 0) for b in top_brands])
        ax.bar(x, vals, width, bottom=bottoms, label=seg, color=PALETTE[i])
        bottoms += vals

    ax.set_title("Price Segment Distribution by Brand", fontsize=15, fontweight="bold", pad=12)
    ax.set_xlabel("Brand")
    ax.set_ylabel("Number of Listings")
    ax.set_xticks(x)
    ax.set_xticklabels(top_brands, rotation=30, ha="right")
    ax.legend(title="Price Range (RUB)", loc="upper right")
    save(fig, "11_stacked_price_by_brand.png")


# ── Main ──────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print(f"Loading {DATA_PATH} ...", flush=True)
    rows = load_data()
    print(f"  {len(rows)} rows loaded", flush=True)

    print("\nGenerating charts ...", flush=True)
    chart_brands_count(rows)
    chart_avg_price_by_brand(rows)
    chart_price_distribution(rows)
    chart_body_types(rows)
    chart_fuel_types(rows)
    chart_transmission(rows)
    chart_price_by_fuel(rows)
    chart_price_by_transmission(rows)
    chart_engine_power(rows)
    chart_year_distribution(rows)
    chart_stacked_price_by_brand(rows)

    print(f"\nAll charts saved to {CHARTS_PATH}", flush=True)
