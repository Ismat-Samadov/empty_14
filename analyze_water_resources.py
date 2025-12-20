import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
from pathlib import Path
import warnings
warnings.filterwarnings('ignore')

# Set style for better-looking plots
sns.set_style("whitegrid")
plt.rcParams['figure.figsize'] = (14, 8)
plt.rcParams['font.size'] = 10

# Create charts directory
Path("charts").mkdir(exist_ok=True)

# Load the data
print("Loading data...")
df = pd.read_csv('data/API_ER.H2O.INTR.PC_DS2_en_csv_v2_438.csv', skiprows=4)

# Clean data: drop columns that are not needed
years = [str(year) for year in range(1960, 2025)]
available_years = [col for col in years if col in df.columns]

print(f"Data loaded: {len(df)} countries/regions")
print(f"Years available: {min(available_years)} to {max(available_years)}")

# Create a clean dataset
data_long = df.melt(
    id_vars=['Country Name', 'Country Code', 'Indicator Name', 'Indicator Code'],
    value_vars=available_years,
    var_name='Year',
    value_name='Water_Resources_Per_Capita'
)

# Convert to numeric
data_long['Year'] = pd.to_numeric(data_long['Year'])
data_long['Water_Resources_Per_Capita'] = pd.to_numeric(data_long['Water_Resources_Per_Capita'], errors='coerce')

# Remove rows with missing values
data_clean = data_long.dropna(subset=['Water_Resources_Per_Capita'])

print(f"Clean data points: {len(data_clean)}")

# Define regions to exclude (aggregated regions, not individual countries)
regions_to_exclude = [
    'World', 'Africa Eastern and Southern', 'Africa Western and Central',
    'Arab World', 'Caribbean small states', 'Central Europe and the Baltics',
    'East Asia & Pacific', 'East Asia & Pacific (excluding high income)',
    'East Asia & Pacific (IDA & IBRD countries)', 'Euro area',
    'Europe & Central Asia', 'Europe & Central Asia (excluding high income)',
    'Europe & Central Asia (IDA & IBRD countries)', 'European Union',
    'Fragile and conflict affected situations', 'Heavily indebted poor countries (HIPC)',
    'High income', 'IBRD only', 'IDA & IBRD total', 'IDA blend',
    'IDA only', 'IDA total', 'Latin America & Caribbean',
    'Latin America & Caribbean (excluding high income)',
    'Latin America & the Caribbean (IDA & IBRD countries)',
    'Least developed countries: UN classification', 'Low & middle income',
    'Low income', 'Lower middle income', 'Middle East & North Africa',
    'Middle East & North Africa (excluding high income)',
    'Middle East & North Africa (IDA & IBRD countries)', 'Middle income',
    'North America', 'Not classified', 'OECD members', 'Other small states',
    'Pacific island small states', 'Post-demographic dividend',
    'Pre-demographic dividend', 'Small states', 'South Asia',
    'South Asia (IDA & IBRD)', 'Sub-Saharan Africa',
    'Sub-Saharan Africa (excluding high income)',
    'Sub-Saharan Africa (IDA & IBRD countries)', 'Upper middle income'
]

# Filter out regional aggregates
countries_only = data_clean[~data_clean['Country Name'].isin(regions_to_exclude)]

print(f"Individual countries: {countries_only['Country Name'].nunique()}")

# ============ CHART 1: Global Trend - Average Water Resources Per Capita Over Time ============
print("\nGenerating Chart 1: Global Trend...")
global_avg = data_clean.groupby('Year')['Water_Resources_Per_Capita'].mean().reset_index()

fig, ax = plt.subplots(figsize=(14, 8))
ax.plot(global_avg['Year'], global_avg['Water_Resources_Per_Capita'],
        linewidth=3, color='#2E86AB', marker='o', markersize=4, markevery=5)
ax.fill_between(global_avg['Year'], global_avg['Water_Resources_Per_Capita'],
                alpha=0.3, color='#2E86AB')

ax.set_xlabel('Year', fontsize=14, fontweight='bold')
ax.set_ylabel('Water Resources Per Capita (cubic meters)', fontsize=14, fontweight='bold')
ax.set_title('Global Average Renewable Freshwater Resources Per Capita (1960-2024)',
             fontsize=16, fontweight='bold', pad=20)
ax.grid(True, alpha=0.3, linestyle='--')

# Add value labels at key points
for i in range(0, len(global_avg), 10):
    year = global_avg.iloc[i]['Year']
    value = global_avg.iloc[i]['Water_Resources_Per_Capita']
    ax.annotate(f'{value:,.0f}', xy=(year, value),
               xytext=(0, 10), textcoords='offset points',
               ha='center', fontsize=9, fontweight='bold',
               bbox=dict(boxstyle='round,pad=0.3', facecolor='white', edgecolor='gray', alpha=0.8))

plt.tight_layout()
plt.savefig('charts/1_global_trend.png', dpi=300, bbox_inches='tight')
plt.close()
print("✓ Chart 1 saved: charts/1_global_trend.png")

# ============ CHART 2: Top 20 Countries with Highest Water Resources (Latest Year) ============
print("\nGenerating Chart 2: Top 20 Countries...")
latest_year = countries_only['Year'].max()
latest_data = countries_only[countries_only['Year'] == latest_year].copy()
top_20 = latest_data.nlargest(20, 'Water_Resources_Per_Capita')

fig, ax = plt.subplots(figsize=(14, 10))
colors = sns.color_palette("viridis", len(top_20))
bars = ax.barh(range(len(top_20)), top_20['Water_Resources_Per_Capita'], color=colors)

ax.set_yticks(range(len(top_20)))
ax.set_yticklabels(top_20['Country Name'], fontsize=11)
ax.set_xlabel('Water Resources Per Capita (cubic meters)', fontsize=14, fontweight='bold')
ax.set_title(f'Top 20 Countries by Renewable Freshwater Resources Per Capita ({int(latest_year)})',
             fontsize=16, fontweight='bold', pad=20)
ax.grid(True, alpha=0.3, axis='x', linestyle='--')

# Add value labels on bars
for i, (idx, row) in enumerate(top_20.iterrows()):
    value = row['Water_Resources_Per_Capita']
    ax.text(value, i, f'  {value:,.0f}', va='center', fontsize=10, fontweight='bold')

ax.invert_yaxis()
plt.tight_layout()
plt.savefig('charts/2_top_20_countries.png', dpi=300, bbox_inches='tight')
plt.close()
print("✓ Chart 2 saved: charts/2_top_20_countries.png")

# ============ CHART 3: Bottom 20 Countries (Water Scarcity) ============
print("\nGenerating Chart 3: Bottom 20 Countries...")
bottom_20 = latest_data.nsmallest(20, 'Water_Resources_Per_Capita')

fig, ax = plt.subplots(figsize=(14, 10))
colors = sns.color_palette("Reds_r", len(bottom_20))
bars = ax.barh(range(len(bottom_20)), bottom_20['Water_Resources_Per_Capita'], color=colors)

ax.set_yticks(range(len(bottom_20)))
ax.set_yticklabels(bottom_20['Country Name'], fontsize=11)
ax.set_xlabel('Water Resources Per Capita (cubic meters)', fontsize=14, fontweight='bold')
ax.set_title(f'Bottom 20 Countries by Renewable Freshwater Resources Per Capita ({int(latest_year)}) - Water Scarcity',
             fontsize=16, fontweight='bold', pad=20)
ax.grid(True, alpha=0.3, axis='x', linestyle='--')

# Add value labels on bars
for i, (idx, row) in enumerate(bottom_20.iterrows()):
    value = row['Water_Resources_Per_Capita']
    ax.text(value, i, f'  {value:,.1f}', va='center', fontsize=10, fontweight='bold')

ax.invert_yaxis()
plt.tight_layout()
plt.savefig('charts/3_bottom_20_countries.png', dpi=300, bbox_inches='tight')
plt.close()
print("✓ Chart 3 saved: charts/3_bottom_20_countries.png")

# ============ CHART 4: Water Resources Change Over Time (Selected Countries) ============
print("\nGenerating Chart 4: Selected Countries Trends...")
# Select diverse countries for comparison
selected_countries = ['United States', 'China', 'India', 'Brazil', 'Egypt, Arab Rep.',
                      'Germany', 'Japan', 'Australia', 'Saudi Arabia', 'Canada']

selected_data = countries_only[countries_only['Country Name'].isin(selected_countries)]

fig, ax = plt.subplots(figsize=(16, 9))
for country in selected_countries:
    country_data = selected_data[selected_data['Country Name'] == country]
    if not country_data.empty:
        ax.plot(country_data['Year'], country_data['Water_Resources_Per_Capita'],
               linewidth=2.5, marker='o', markersize=3, label=country, alpha=0.8)

ax.set_xlabel('Year', fontsize=14, fontweight='bold')
ax.set_ylabel('Water Resources Per Capita (cubic meters)', fontsize=14, fontweight='bold')
ax.set_title('Water Resources Per Capita Trends - Selected Major Countries (1960-2024)',
             fontsize=16, fontweight='bold', pad=20)
ax.legend(loc='best', fontsize=11, framealpha=0.9)
ax.grid(True, alpha=0.3, linestyle='--')

plt.tight_layout()
plt.savefig('charts/4_selected_countries_trends.png', dpi=300, bbox_inches='tight')
plt.close()
print("✓ Chart 4 saved: charts/4_selected_countries_trends.png")

# ============ CHART 5: Percentage Change from 1962 to Latest Year ============
print("\nGenerating Chart 5: Percentage Change Analysis...")
# Use 1962 as baseline (more countries have data)
baseline_year = 1962
countries_baseline = countries_only[countries_only['Year'] == baseline_year][['Country Name', 'Water_Resources_Per_Capita']].rename(
    columns={'Water_Resources_Per_Capita': 'Baseline'})
countries_latest = countries_only[countries_only['Year'] == latest_year][['Country Name', 'Water_Resources_Per_Capita']].rename(
    columns={'Water_Resources_Per_Capita': 'Latest'})

change_data = pd.merge(countries_baseline, countries_latest, on='Country Name')
change_data['Percentage_Change'] = ((change_data['Latest'] - change_data['Baseline']) / change_data['Baseline']) * 100
change_data = change_data.dropna()

# Get top 15 increases and decreases
top_increases = change_data.nlargest(15, 'Percentage_Change')
top_decreases = change_data.nsmallest(15, 'Percentage_Change')

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(18, 10))

# Top increases
colors_inc = ['green' if x > 0 else 'red' for x in top_increases['Percentage_Change']]
ax1.barh(range(len(top_increases)), top_increases['Percentage_Change'], color=colors_inc, alpha=0.7)
ax1.set_yticks(range(len(top_increases)))
ax1.set_yticklabels(top_increases['Country Name'], fontsize=10)
ax1.set_xlabel('Percentage Change (%)', fontsize=12, fontweight='bold')
ax1.set_title(f'Top 15 Countries: Largest Increases\n({baseline_year} to {int(latest_year)})',
              fontsize=14, fontweight='bold')
ax1.grid(True, alpha=0.3, axis='x')
ax1.invert_yaxis()

for i, (idx, row) in enumerate(top_increases.iterrows()):
    value = row['Percentage_Change']
    ax1.text(value, i, f'  {value:+.1f}%', va='center', fontsize=9, fontweight='bold')

# Top decreases
colors_dec = ['green' if x > 0 else 'red' for x in top_decreases['Percentage_Change']]
ax2.barh(range(len(top_decreases)), top_decreases['Percentage_Change'], color=colors_dec, alpha=0.7)
ax2.set_yticks(range(len(top_decreases)))
ax2.set_yticklabels(top_decreases['Country Name'], fontsize=10)
ax2.set_xlabel('Percentage Change (%)', fontsize=12, fontweight='bold')
ax2.set_title(f'Top 15 Countries: Largest Decreases\n({baseline_year} to {int(latest_year)})',
              fontsize=14, fontweight='bold')
ax2.grid(True, alpha=0.3, axis='x')
ax2.invert_yaxis()

for i, (idx, row) in enumerate(top_decreases.iterrows()):
    value = row['Percentage_Change']
    ax2.text(value, i, f'  {value:+.1f}%', va='center', fontsize=9, fontweight='bold')

plt.tight_layout()
plt.savefig('charts/5_percentage_change_analysis.png', dpi=300, bbox_inches='tight')
plt.close()
print("✓ Chart 5 saved: charts/5_percentage_change_analysis.png")

# ============ CHART 6: Distribution Histogram ============
print("\nGenerating Chart 6: Distribution Analysis...")
fig, ax = plt.subplots(figsize=(14, 8))

# Use log scale for better visualization
latest_data_clean = latest_data[latest_data['Water_Resources_Per_Capita'] > 0]
ax.hist(np.log10(latest_data_clean['Water_Resources_Per_Capita']),
        bins=40, color='#2E86AB', alpha=0.7, edgecolor='black')

ax.set_xlabel('Water Resources Per Capita (log10 scale)', fontsize=14, fontweight='bold')
ax.set_ylabel('Number of Countries', fontsize=14, fontweight='bold')
ax.set_title(f'Distribution of Water Resources Per Capita Across Countries ({int(latest_year)})',
             fontsize=16, fontweight='bold', pad=20)
ax.grid(True, alpha=0.3, axis='y', linestyle='--')

# Add reference lines for interpretation
median_val = np.log10(latest_data_clean['Water_Resources_Per_Capita'].median())
mean_val = np.log10(latest_data_clean['Water_Resources_Per_Capita'].mean())

ax.axvline(median_val, color='red', linestyle='--', linewidth=2, label=f'Median: {10**median_val:,.0f} m³')
ax.axvline(mean_val, color='green', linestyle='--', linewidth=2, label=f'Mean: {10**mean_val:,.0f} m³')
ax.legend(fontsize=12)

# Add x-axis labels in actual values
xticks = ax.get_xticks()
ax.set_xticklabels([f'{10**x:,.0f}' for x in xticks], rotation=45)

plt.tight_layout()
plt.savefig('charts/6_distribution_histogram.png', dpi=300, bbox_inches='tight')
plt.close()
print("✓ Chart 6 saved: charts/6_distribution_histogram.png")

# ============ CHART 7: Decadal Average Comparison ============
print("\nGenerating Chart 7: Decadal Analysis...")
# Create decade bins
countries_only_copy = countries_only.copy()
countries_only_copy['Decade'] = (countries_only_copy['Year'] // 10) * 10

# Calculate decadal averages
decadal_avg = countries_only_copy.groupby('Decade')['Water_Resources_Per_Capita'].agg(['mean', 'median', 'std']).reset_index()

fig, ax = plt.subplots(figsize=(14, 8))
x = range(len(decadal_avg))
width = 0.35

bars1 = ax.bar([i - width/2 for i in x], decadal_avg['mean'], width,
               label='Mean', color='#2E86AB', alpha=0.8)
bars2 = ax.bar([i + width/2 for i in x], decadal_avg['median'], width,
               label='Median', color='#A23B72', alpha=0.8)

ax.set_xlabel('Decade', fontsize=14, fontweight='bold')
ax.set_ylabel('Water Resources Per Capita (cubic meters)', fontsize=14, fontweight='bold')
ax.set_title('Decadal Average Renewable Freshwater Resources Per Capita',
             fontsize=16, fontweight='bold', pad=20)
ax.set_xticks(x)
ax.set_xticklabels([f"{int(d)}s" for d in decadal_avg['Decade']], fontsize=12)
ax.legend(fontsize=12)
ax.grid(True, alpha=0.3, axis='y', linestyle='--')

# Add value labels
for i, (mean_val, median_val) in enumerate(zip(decadal_avg['mean'], decadal_avg['median'])):
    ax.text(i - width/2, mean_val, f'{mean_val:,.0f}', ha='center', va='bottom', fontsize=9, fontweight='bold')
    ax.text(i + width/2, median_val, f'{median_val:,.0f}', ha='center', va='bottom', fontsize=9, fontweight='bold')

plt.tight_layout()
plt.savefig('charts/7_decadal_comparison.png', dpi=300, bbox_inches='tight')
plt.close()
print("✓ Chart 7 saved: charts/7_decadal_comparison.png")

# ============ CHART 8: Water Scarcity Categories ============
print("\nGenerating Chart 8: Water Scarcity Categories...")
# Define water scarcity thresholds (cubic meters per person per year)
# Based on UN classification
def categorize_water_scarcity(value):
    if value < 500:
        return 'Absolute Scarcity (<500)'
    elif value < 1000:
        return 'Scarcity (500-1000)'
    elif value < 1700:
        return 'Stress (1000-1700)'
    elif value < 5000:
        return 'Vulnerable (1700-5000)'
    else:
        return 'Sufficient (>5000)'

latest_data_clean['Scarcity_Category'] = latest_data_clean['Water_Resources_Per_Capita'].apply(categorize_water_scarcity)
category_counts = latest_data_clean['Scarcity_Category'].value_counts()

# Define order for categories
category_order = ['Absolute Scarcity (<500)', 'Scarcity (500-1000)', 'Stress (1000-1700)',
                  'Vulnerable (1700-5000)', 'Sufficient (>5000)']
category_counts = category_counts.reindex(category_order)

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(18, 8))

# Bar chart
colors_cat = ['#8B0000', '#DC143C', '#FF8C00', '#FFD700', '#228B22']
bars = ax1.bar(range(len(category_counts)), category_counts.values, color=colors_cat, alpha=0.8, edgecolor='black')
ax1.set_xticks(range(len(category_counts)))
ax1.set_xticklabels(category_counts.index, rotation=45, ha='right', fontsize=10)
ax1.set_ylabel('Number of Countries', fontsize=12, fontweight='bold')
ax1.set_title(f'Countries by Water Scarcity Category ({int(latest_year)})',
              fontsize=14, fontweight='bold', pad=15)
ax1.grid(True, alpha=0.3, axis='y', linestyle='--')

for i, v in enumerate(category_counts.values):
    ax1.text(i, v, f'{int(v)}', ha='center', va='bottom', fontsize=11, fontweight='bold')

# Pie chart
ax2.pie(category_counts.values, labels=category_counts.index, autopct='%1.1f%%',
        colors=colors_cat, startangle=90, textprops={'fontsize': 10, 'fontweight': 'bold'})
ax2.set_title(f'Distribution of Countries by Water Availability ({int(latest_year)})',
              fontsize=14, fontweight='bold', pad=15)

plt.tight_layout()
plt.savefig('charts/8_water_scarcity_categories.png', dpi=300, bbox_inches='tight')
plt.close()
print("✓ Chart 8 saved: charts/8_water_scarcity_categories.png")

# ============ Generate Summary Statistics ============
print("\n" + "="*60)
print("SUMMARY STATISTICS")
print("="*60)

summary_stats = {
    'Total Countries Analyzed': countries_only['Country Name'].nunique(),
    'Years Covered': f"{int(countries_only['Year'].min())} - {int(countries_only['Year'].max())}",
    'Latest Year': int(latest_year),
    'Global Average (Latest)': f"{latest_data['Water_Resources_Per_Capita'].mean():,.2f} m³",
    'Global Median (Latest)': f"{latest_data['Water_Resources_Per_Capita'].median():,.2f} m³",
    'Highest (Latest)': f"{latest_data['Water_Resources_Per_Capita'].max():,.2f} m³ ({latest_data.loc[latest_data['Water_Resources_Per_Capita'].idxmax(), 'Country Name']})",
    'Lowest (Latest)': f"{latest_data['Water_Resources_Per_Capita'].min():,.2f} m³ ({latest_data.loc[latest_data['Water_Resources_Per_Capita'].idxmin(), 'Country Name']})",
    'Countries with Absolute Water Scarcity (<500)': int(category_counts.get('Absolute Scarcity (<500)', 0)),
    'Countries with Water Scarcity (500-1000)': int(category_counts.get('Scarcity (500-1000)', 0)),
    'Countries with Water Stress (1000-1700)': int(category_counts.get('Stress (1000-1700)', 0)),
}

for key, value in summary_stats.items():
    print(f"{key}: {value}")

# Save summary to file
with open('charts/summary_statistics.txt', 'w') as f:
    f.write("="*60 + "\n")
    f.write("WATER RESOURCES ANALYSIS - SUMMARY STATISTICS\n")
    f.write("="*60 + "\n\n")
    for key, value in summary_stats.items():
        f.write(f"{key}: {value}\n")

print("\n✓ Summary statistics saved: charts/summary_statistics.txt")
print("\n" + "="*60)
print("ALL CHARTS GENERATED SUCCESSFULLY!")
print("="*60)
print(f"\nTotal charts created: 8")
print(f"Charts location: ./charts/")
