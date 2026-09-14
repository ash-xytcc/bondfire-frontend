# DPG VPS deployment

This deployment is for Adam's Docker + Traefik VPS and is intentionally separate from the legacy Ghost stack.

## Safety model

- The new application container is named `dpg-app`.
- The old Ghost container is named `dpg` and is not modified or deleted.
- The new container joins the existing external Docker network named `web`.
- Traefik is disabled for the new container by default.
- The app is exposed only on `127.0.0.1:8788` for preflight testing before cutover.
- Application state is stored in the named Docker volume `dpg-state`.
- Do not delete the `dpg-state` volume during upgrades.

## Important data note

The VPS runtime creates local persisted versions of the app's D1, KV, and R2 bindings. A brand-new `dpg-state` volume is therefore a new application data store.

If the existing Cloudflare-backed DPG deployment contains organization records, memberships, edited public-site configuration, bulletin content, files, shares, or other data that must survive, migrate that state before the final domain cutover. Do not assume the repository contains that runtime data.

The legacy Ghost database/content is a separate system and should remain intact until the new deployment is verified.

## 1. Check out the DPG branch into a new directory

Do not place the new app over the existing Ghost directory.

```bash
cd /opt
git clone --branch dpg https://github.com/ash-xytcc/bondfire-frontend.git dpg-app
cd /opt/dpg-app
```

If it is already cloned:

```bash
cd /opt/dpg-app
git fetch origin
git checkout dpg
git pull --ff-only origin dpg
```

## 2. Build and start with Traefik disabled

```bash
TRAEFIK_ENABLE=false docker compose -f docker-compose.vps.yml up -d --build
```

Check container status and logs:

```bash
docker compose -f docker-compose.vps.yml ps
docker compose -f docker-compose.vps.yml logs --tail=100 dpg-app
```

## 3. Preflight locally on the VPS

```bash
curl -fsS http://127.0.0.1:8788/api/health
curl -I http://127.0.0.1:8788/
curl -I http://127.0.0.1:8788/about
```

The health endpoint must return success and the public routes must respond before touching Ghost.

## 4. Preserve/verify application state

Before the live switch, either:

1. import the existing DPG application state into the `dpg-state` volume, or
2. explicitly verify that the existing Cloudflare D1/KV/R2 state is disposable and that a fresh VPS state is intended.

Do not perform the live switch merely because the homepage renders.

## 5. Cut over from Ghost

The existing Ghost compose names its public container `dpg`. Stop it without deleting it:

```bash
docker stop dpg
```

Then enable the new Traefik router:

```bash
cd /opt/dpg-app
TRAEFIK_ENABLE=true docker compose -f docker-compose.vps.yml up -d
```

The router is configured for both:

- `dualpowergathering.org`
- `www.dualpowergathering.org`

It uses Adam's existing `websecure` entrypoint, `http-le` certificate resolver, `web` Docker network, and `chain-no-auth@file` middleware.

## 6. Verify the live site

```bash
curl -I https://dualpowergathering.org/
curl -fsS https://dualpowergathering.org/api/health
curl -I https://www.dualpowergathering.org/
```

Then verify in a browser:

- public home
- About / FAQ / Volunteer / Donate / Press
- DPG Shares / Sessions / RSVP
- organizer sign-in
- at least one authenticated data read/write if organizer data is in use

## Rollback

Disable the new router and restart Ghost:

```bash
cd /opt/dpg-app
TRAEFIK_ENABLE=false docker compose -f docker-compose.vps.yml up -d
docker start dpg
```

Do not run `docker compose down -v` on the new stack. The `-v` flag would delete the persisted application state.

## Optional runtime secrets

The container creates and persists its own JWT signing secret in `dpg-state` unless `JWT_SECRET` is explicitly supplied.

Additional Pages Function variables/secrets can be mounted at:

```text
/run/secrets/dpg-extra-vars
```

using dotenv syntax. Do not commit that file to Git.
