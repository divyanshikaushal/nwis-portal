# Deploy NWIS on Vercel

This branch uses standard Next.js. `pnpm build` creates `.next/routes-manifest.json`.
The original Sites deployment is separate and is not modified by these files.

## 1. Update GitHub

Copy the contents of the supplied ZIP into your existing local `nwis-portal` checkout,
replacing matching files (do not copy the enclosing folder). Commit and push using
GitHub Desktop. The ZIP contains no credentials or installed dependencies.

## 2. Vercel project settings

- Framework Preset: **Next.js**
- Root Directory: the folder containing `package.json` (blank/default if at repository root)
- Build Command: **pnpm build**
- Output Directory: **.next** (or Next.js default; remove any `dist` override)
- Install Command: **pnpm install --frozen-lockfile**
- Node.js: **22.x**

Redeploy the new commit. The checked-in `vercel.json` selects Next.js and `.next`.
Keep the included `pnpm-lock.yaml` with the updated `package.json`.

The dashboard, maps, synthetic evidence, simulation, validation and browser OCR work
without a storage account. Saving reports and loading previously saved records require
step 3. Without it the app shows a saved-reports warning and never pretends a save succeeded.

## 3. Persistent storage

The app continues to use Cloudflare D1 and private R2 storage, accessed from Vercel's
server routes over HTTPS. Sites-managed DB/BUCKET bindings do not transfer to Vercel.
Create resources in your own Cloudflare account; old uploaded reports are not migrated
by this source-code update.

1. Create a D1 database. Run `docs/vercel-schema.sql` once in its SQL console (new database only).
2. Create a private R2 bucket.
3. Create a Cloudflare API token scoped to your account with D1 Edit permission.
4. Create R2 S3 credentials with Object Read & Write access limited to this bucket.
5. Add the following in Vercel → Project → Settings → Environment Variables:

| Name | Value |
| --- | --- |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID |
| `CLOUDFLARE_D1_DATABASE_ID` | The D1 database ID |
| `CLOUDFLARE_D1_API_TOKEN` | D1 API token |
| `R2_BUCKET_NAME` | Your bucket name |
| `R2_ACCESS_KEY_ID` | R2 S3 access key ID |
| `R2_SECRET_ACCESS_KEY` | R2 S3 secret access key |
| `R2_ENDPOINT` | Optional: jurisdiction-specific S3 endpoint; omit for default global endpoint |

Set them for the Vercel environments you intend to use and redeploy. Do not put secrets
in GitHub or prefix them with `NEXT_PUBLIC_`. These variables are only used on the server.
For local development, place them in ignored `.env.local`, then run `pnpm dev`.

## 4. Verify your deployment

- Open Overview and run a simulation.
- Run Demo validation and check results.
- Report ingestion → Try sample PDF → review → confirm and save.
- Refresh the page: the saved event must remain in Knowledge base.
- Open its evidence and original report.
- Try saving the same incident again: it should be flagged as a duplicate.

Uploads are limited to 4 MB (and 20 PDF pages) to leave room for multipart overhead
under Vercel's 4.5 MB function payload limit. Existing larger source documents would
need a direct-download design. The D1 REST API is adequate for this prototype but
has account API rate limits; use a dedicated storage service/Worker for production scale.

## Access and scope

The Sites owner-only access gate does not transfer with source code. This prototype
has no application login. Use Vercel deployment protection/access controls for a
private demo; anyone who can reach an unprotected deployment can read and add records.
Use synthetic documents only. Simulation remains rule-based; this change adds no real
OIL feed or trained risk model.

The build can be tested without credentials. Actual D1/R2 connectivity and live Vercel
upload persistence still need verification after you configure your account.
