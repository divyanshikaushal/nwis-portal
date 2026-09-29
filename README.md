# Vercel deployment update

This checkout now builds with standard Next.js. Follow [Vercel setup](docs/VERCEL.md) for build settings and persistent storage. Older Sites-specific instructions below describe the original hosting environment.

# NWIS — Nearby Wells Intelligence System

SIH 26121 demonstration prototype. Standalone decision support alongside eRTMAC.

## Demo journey

1. Start on Overview with NW-01 active and a 10 km radius.
2. Inspect a nearby well on the map and open its historical evidence.
3. Click Run demo. Advance to 2,120 m TVD to see a high-concern mud-loss warning.
4. Open Why this alert? Inspect the formation-relative depth, source excerpt and recorded mitigation.
5. Compare NW-01, OW-02 and OW-03 using formation-relative and absolute TVD views.
6. Open Report ingestion, try the sample PDF, review fields, check the source-verification box and confirm. Find the saved event in Knowledge base.

## Working scope

- Seven synthetic wells with geospatial radius filtering and an OpenStreetMap basemap.
- Ten synthetic source-linked historical events across six risk categories.
- Search, event filters, evidence panels and JSON export.
- Formation-top-relative TVD correlation; MD records excluded from TVD alerts.
- Adjustable depth simulation with transparent 100 m watch / 40 m high-concern thresholds.
- Browser PDF parsing and English OCR for scanned pages/images, followed by pattern-assisted field extraction and human review.
- Durable report storage (R2) and confirmed event storage (D1).

## Limits

Not connected to OIL or eRTMAC. All seeded locations, geology and events are illustrative. Risk rules are unvalidated demonstration thresholds, not trained predictive ML or calibrated risk probabilities. Keyword extraction is not a general drilling NLP model; it requires manual review, including negation, units and multiple incidents. No verified trajectory conversion, automatic drilling control, or operational safety certification. PDF limit: 20 pages / 10 MB. OCR quality depends on the scan. Internet is needed for basemap tiles; coordinate markers and tables remain usable without tiles. App hosting and durable saves require connectivity.

## Validation

TypeScript and production build pass. Risk tests cover formation matching, geographic exclusion, MD exclusion, early-warning classification, and no-warning state before the look-ahead window. D1 migration applied successfully in local storage. Browser UI and WebMCP runtime validation were unavailable; end-to-end upload/OCR interactions still need a browser walkthrough.

## Development

Uses the provided Vinext/React starter, D1 and R2. Follow the package scripts in package.json. Database schema is in db/schema.ts; generated migrations in drizzle/. This source export has no hosted project identity. Configure deployment and storage separately when self-hosting. See docs/DEMO_AND_GITHUB.md for the demo and GitHub guide.


## Added demo features

- Every seeded incident links to a one-page synthetic PDF and its rendered page preview.
- Risk monitor has Mud loss, Stuck pipe and Kick presets (NW-01 / 10 km), paused for evidence review.
- Evidence panels show distance, formation, TVD and alert-window checks for included and excluded records.
- Extraction flags missing fields, feet, negation and multiple incident types. OCR confidence is displayed only when the OCR engine reports it; it is not risk confidence. Human source confirmation is required.
- Same well/type/formation/depth/basis combinations are blocked as duplicate events. Server checks seeded and saved events, with an atomic uniqueness reservation for new writes. No event-date differentiation is implemented.
- Demo validation runs shared app functions against seven extraction fixtures (41 field checks), 12 alert fixtures, three search cases and four duplicate cases. All passed at implementation time; user-run results are calculated afresh and can be exported.
- Scenario and evidence-explanation parity checks passed. All 11 PDFs produced the expected structured fields in PDF text extraction checks. Browser OCR and hosted writes were not tested end to end.

Run validation from the sidebar. These are deterministic software checks on synthetic fixtures, not field validation or trained model performance.
