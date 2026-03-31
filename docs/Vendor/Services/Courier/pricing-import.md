# Courier Pricing Import (Multi-Format)

Last updated: 30 March 2026

## 1) Problem

Each courier vendor can upload pricing in different formats:
- Excel tables (city + zone + first kg + extra kg)
- PDF zone lists (city groupings by zones)
- Different column names and layouts per company

A direct one-off parser per file is brittle. The import must be adapter-based and normalize into one canonical schema.

## 2) Canonical Schema (target)

Use one normalized model before writing to `courier_vendor_settings.settings`:

1. `zone_master`
- zone code and label per service category
- catch-all flag support (for rows like "Rest of the Cities")

2. `city_zone_map`
- city -> zone mapping used by lane matching and zone resolution

3. `zone_rate_card`
- zone-level pricing (`first_kg`, `extra_kg`, currency)
- optional city-level overrides if source provides city-specific pricing

## 3) Adapter Strategy

Build one adapter per source type/company template:

1. `ExcelCityRateAdapter`
- parse tabular rows
- map source headers to canonical names
- normalize city/zone/rate values

2. `PdfZoneListAdapter`
- parse zone list tables from PDF
- extract zone columns even when one zone spans multiple subcolumns
- normalize city names and capture catch-all markers

3. `Validation + Reconciliation`
- detect `city -> different zone` conflicts across files
- require manual approval for conflicts before publish

## 4) Files Added For This Workflow

- Export script:
  - `scripts/pricing/export_attached_pricing_sources.py`

- Generated exports from attached files:
  - `zones with prices/exports/city_rate_card_from_excel.csv`
  - `zones with prices/exports/zone_rate_card_from_excel.csv`
  - `zones with prices/exports/city_zone_map_from_pdf.csv`
  - `zones with prices/exports/zone_master_from_pdf.csv`
  - `zones with prices/exports/city_zone_map_merged.csv`
  - `zones with prices/exports/zone_conflicts.csv`
  - `zones with prices/exports/export_summary.json`

## 5) How To Run Export

```bash
/Users/alexchamara/Office/Transport-jaan/.venv/bin/python scripts/pricing/export_attached_pricing_sources.py \
  --excel "zones with prices/Copy of courier (1).xlsx" \
  --pdf "zones with prices/Domestic Zone List.pdf" \
  --out-dir "zones with prices/exports"
```

## 6) Recommended Import Lifecycle In App

1. Upload source files to staging (`pricing_import_batches` + `pricing_import_files`).
2. Run adapter parse job and store normalized rows (`pricing_import_rows`).
3. Show preview UI:
- zone counts
- city counts
- rate rows
- conflict list (`zone_conflicts`)
4. User resolves conflicts in UI.
5. Convert approved rows into vendor pricing draft JSON:
- `settings.pricing.zoneMaster`
- `settings.pricing.laneMatrix` seed rows (zone-to-zone defaults)
- `settings.pricing.categoryConfig` zone rates
6. Save draft and publish through existing pricing governance flow.

## 7) Result From Attached Files

The attached samples were normalized and exported successfully.

Key summary:
- Excel rows parsed: `1988`
- Zones in Excel: `4`
- Zones in PDF: `4`
- Cities parsed from PDF: `564`
- Merged city-zone rows: `2552`
- Conflicts detected: `80`

Use `zone_conflicts.csv` for manual reconciliation before final publish.
