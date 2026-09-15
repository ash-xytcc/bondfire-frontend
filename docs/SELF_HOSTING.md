# Self-hosting Bondfire

This repository is a Cloudflare Pages + Pages Functions application. The frontend builds with Vite, private application data is stored in D1, public Organization Page configuration uses KV, and Drive/private object payloads use R2 where configured.

This guide describes the repository-supported deployment path. It does not create Cloudflare resources for you and it does not contain production secrets.

## Prerequisites

- Node.js 24 or newer and npm.
- A Cloudflare account with Pages, D1, KV, and R2 available.
- A copy of this repository.
- A strong random value for `JWT_SECRET` stored as a Cloudflare secret, not committed to Git.

The repository does not include a `wrangler.toml`. Configure bindings in the Cloudflare Pages project settings, or maintain an operator-owned Wrangler configuration outside this repository.

## Install and validate

```sh
npm install --no-audit --no-fund
npm test
npm run smoke:thread1
npm run build
```

The production build output is `dist/`.

No separate TypeScript or lint command is currently configured in `package.json`.

## Required runtime bindings

Configure these bindings for the Pages project:

- `BF_DB` — D1 database used by the authenticated application and module APIs.
- `BF_PUBLIC` — KV namespace used by public Organization Pages.
- `BF_DRIVE_BUCKET` — R2 bucket used for Drive/private object payloads and scoped publication media where object storage is required.
- `JWT_SECRET` — secret used to sign and verify application sessions.

Set the deployment mode explicitly:

```text
BONDFIRE_DEPLOYMENT_MODE=self-hosted
```

`BONDFIRE_DEPLOYMENT_MODE=hosted` is reserved for the hosted Bondfire deployment. If the value is omitted, the support subsystem currently defaults to self-hosted behavior, but an explicit value is recommended for an operator-managed deployment.

The browser uses same-origin Pages Functions by default. Leave `VITE_API_BASE_URL` empty unless you intentionally operate the API on a different origin.

Optional support-contact and Cloudflare Email settings are documented in `docs/SUPPORT_DEPLOYMENT.md`.

## D1 setup

For a new database, apply `db/schema.sql` before first use. With Wrangler, an operator can run the equivalent of:

```sh
npx wrangler@latest d1 execute <database-name> --remote --file=./db/schema.sql
```

Then bind that database to the Pages project as `BF_DB`.

The application also contains runtime schema guards in `functions/api/_lib/schema.js` for tables and columns used by current APIs. Versioned application migrations are defined in `functions/api/_lib/migrations.js`; their ordering and rerun behavior are covered by `npm run test:migrations`.

Files under `migrations/` and `db/migrations/` include historical/manual migrations from earlier development stages. Some use bare `ALTER TABLE ... ADD COLUMN` statements because D1 does not support `ADD COLUMN IF NOT EXISTS`. Do not blindly replay those historical files on an already-upgraded database. Use the migration/version handling in the release you are upgrading to and take a database backup first.

## Cloudflare Pages setup

Create a Pages project from this repository and use:

```text
Build command: npm run build
Build output directory: dist
Node.js: 24 or newer
```

Attach the D1, KV, and R2 bindings listed above to both the production environment and any preview environment in which you expect full application behavior. Add `JWT_SECRET` as an encrypted secret/variable in the deployment environment.

The `functions/` directory is the Pages Functions backend and is deployed with the Pages project. The frontend uses hash routing, so application routes after `#` do not require server-side rewrite rules.

## First-run bootstrap

There is no repository-defined default administrator account or bootstrap password.

After deployment:

1. Load the deployed application.
2. Create the first normal account through the registration flow.
3. Create an organization from the application UI, or redeem an invitation if one already exists.
4. Select the organization modules and security level required for that organization.

Normal account creation does not require an organization to be created server-side.

## Upgrades

Before deploying an upgrade:

1. Back up D1.
2. Back up the `BF_PUBLIC` KV namespace if public Organization Page configuration matters to your recovery plan.
3. Back up the `BF_DRIVE_BUCKET` R2 bucket if it contains files or publication media.
4. Preserve member-held recovery material needed to unlock encrypted organization data.
5. Review the target release for schema/migration notes.
6. Install dependencies, run the complete test suite, and build the release.
7. Deploy the new Pages artifact and Functions code together.

Do not run old manual SQL migrations a second time merely because the files remain in the repository. Versioned migrations are intended to be ordered deterministically; historical D1 `ALTER TABLE` scripts are not all independently rerunnable.

## Backup and recovery basics

Bondfire does not turn provider-level backups into plaintext. Private organization content is expected to remain ciphertext-authoritative in server storage.

A complete operator backup may require three separate Cloudflare data stores:

- D1 for relational application state and ciphertext records.
- KV (`BF_PUBLIC`) for public Organization Page configuration.
- R2 (`BF_DRIVE_BUCKET`) for Drive/private object payloads and scoped media.

Use Cloudflare-supported export/copy mechanisms for the resources you operate. Keep encrypted backups protected as production data even though private records are ciphertext.

Server backups do not replace member recovery material. If an organization loses every usable client-side recovery path/key, an operator-side D1/R2 backup is not a plaintext recovery key.

## Hosted deployment

The hosted Bondfire service uses the same build and application code but is configured with platform-managed bindings and:

```text
BONDFIRE_DEPLOYMENT_MODE=hosted
```

Hosted-only operational values and secrets belong in the deployment environment, not in tracked `.env` files.

## Release validation

Before promoting a self-hosted release, run:

```sh
npm test
npm run smoke:thread1
npm run build
```

The release-candidate suite includes public-surface, authentication, signup, private-storage/encryption, key-scope, migration, private-publication, Studio, submission, and emergency/destructive-flow regressions. Browser/device-specific behavior still requires normal deployment smoke testing on the target environment.
