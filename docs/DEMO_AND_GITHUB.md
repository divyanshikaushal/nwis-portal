# Presenting NWIS and creating your GitHub repository

## What this prototype demonstrates

NWIS demonstrates nearby-well discovery, historical event retrieval, formation-relative comparison, simulated early warnings, and report ingestion with editable review. You can show screenshots in a PPT and record the app in a video. Check your competition's submission format and AI-assistance disclosure requirements separately.

Keep the synthetic-data label visible. Describe the alert engine as rule-based; do not describe it as a trained predictive model. The simulation is not a live OIL/eRTMAC feed.

## Suggested 2–3 minute video

- 0:00–0:20 — Explain the problem: historical drilling experience is scattered across reports.
- 0:20–0:45 — On Overview, choose NW-01 and a 10 km radius. Select an offset well.
- 0:45–1:05 — Search mud loss in Knowledge base and open source evidence.
- 1:05–1:30 — Compare NW-01, OW-02 and OW-03 using formation-relative depths.
- 1:30–2:00 — Run the simulation, pause at around 2,120 m TVD and open Why this alert?
- 2:00–2:30 — In Report ingestion, choose Try sample PDF. Review the fields, check the verification box and save the event. Show it in Knowledge base.
- 2:30–2:45 — Explain the next steps: OIL data access, validated ML and real eRTMAC integration.

Rehearse the complete flow before recording. The build and risk rules were checked, but browser upload/OCR workflows were not verified end to end. Use browser fullscreen mode if you do not want the account-based address visible in the recording.

## PPT screenshots

Use three large screenshots: the well map, formation comparison, and evidence-backed risk alert. A fourth screenshot can show the report review screen. Add a short label below each. Include the repository URL and an accessible demo/video link according to the submission rules. The currently hosted app is owner-private; a link alone does not grant judges access.

## Beginner-friendly GitHub Desktop method

1. Download the source ZIP and extract it.
2. Install GitHub Desktop from https://desktop.github.com/ and sign in.
3. Choose File > New repository. Name it `nwis-prototype` and choose a local folder.
4. Do not add a new license automatically. The source already includes its relevant third-party notices; choose a license for your original work separately if needed.
5. Open the newly created repository folder. Copy everything INSIDE the extracted `nwis-prototype` folder into it, including `.gitignore` and `.openai`. Copy the project contents, not another enclosing folder. Keep the new repository's `.git` folder.
6. In GitHub Desktop, review Changes. Use `Add NWIS prototype` as the summary and click Commit to main (or the branch displayed).
7. Click Publish repository. Choose private unless your submission requires public source or you want to share it publicly.
8. Use Repository > View on GitHub to get your repository URL.

Official guide: https://docs.github.com/en/desktop/overview/creating-your-first-repository-using-github-desktop

The export contains source, synthetic data, database migrations, OCR/PDF assets and instructions. It excludes Git history, build output, dependencies, credentials, uploaded reports and local databases. Its original hosted project ID has been removed; the logical DB/BUCKET binding names remain so the code structure is preserved.

## Repository versus hosted app

Publishing code to GitHub does not automatically publish the running app or transfer uploaded documents. This app uses server routes, D1 and R2; a complete deployment needs a compatible server runtime and storage. It cannot run unchanged as a static-only GitHub Pages site. Your existing hosted demo remains a separate deployment, and edits in your new GitHub repository will not automatically update it.

Source export does not include production uploaded reports or reviewed database records. `Export repository` in the app downloads event JSON, not source code or original report files.


## Additional presentation controls

Use the three scenario buttons on Risk monitor to load a reproducible warning immediately. In the evidence panel, expand Preview source page to show the actual sample PDF page, then inspect Why these wells? for matching and excluded offsets. Use Demo validation > Run demo tests to show real fixture results; identify them as synthetic software checks, not operational prediction accuracy. Re-uploading the same sample after it has been saved triggers a matching-event notice rather than creating another copy.
