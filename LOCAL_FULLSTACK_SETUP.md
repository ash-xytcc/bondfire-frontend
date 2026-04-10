# Local full-stack setup for Bondfire/DPG

This sets up the actual app locally, not a fake proxy.

## 1. Install deps

```bash
npm install
```

## 2. Install Wrangler auth

```bash
npx wrangler login
```

## 3. Create the three Cloudflare resources once

```bash
npx wrangler d1 create bondfire-local
npx wrangler kv namespace create BF_PUBLIC
npx wrangler kv namespace create BF_E2EE
```

Copy the IDs Wrangler prints.

## 4. Paste those IDs into `wrangler.jsonc`

Replace:
- `d1_databases[0].database_id`
- `kv_namespaces[0].id`
- `kv_namespaces[0].preview_id`
- `kv_namespaces[1].id`
- `kv_namespaces[1].preview_id`

## 5. Create your local secret file

Copy `.dev.vars.example` to `.dev.vars` and fill in real secrets.

PowerShell:

```powershell
Copy-Item .dev.vars.example .dev.vars
```

## 6. Seed the local D1 database

```bash
npm run db:seed:local
```

This seeds:
- `db/schema.sql`
- `db/migrations/2026-02-22_zk_everything.sql`
- `db/migrations/2026-03-25_studio_zk.sql`

## 7. Run the full stack locally

```bash
npm run dev:full
```

That serves both the built frontend and Pages Functions together.

## 8. Test DPG mode

Open:

```text
http://127.0.0.1:8788/?app=dpg
```

Then click Organizer login.

## Notes

- This uses **local persisted Cloudflare resources** under `.wrangler/state`, so your test data survives restarts.
- Auth, register, `/api/*`, and the app shell should all run on the same local origin.
- If you change frontend code, rebuild before relaunching `npm run dev:full`.
