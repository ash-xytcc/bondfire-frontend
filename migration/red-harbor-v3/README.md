# Red Harbor V3 migration handoff

This directory defines the Red Harbor-specific surface that must be carried from the legacy Red Harbor deployment into current Bondfire V3.

## Source of truth

- Repository: `ash-xytcc/bondfire-frontend`
- Source branch: `red-harbor`
- Source commit: `bedd38d8ef947c88e1bdebca8823fb45269556ba`
- Staging branch: `red-harbor-v3`

The `red-harbor` branch remains untouched. This staging branch exists only to prepare a clean handoff into the current Bondfire repository.

## Migration rule

Preserve Red Harbor's public-facing product and branch-specific presentation. Replace the legacy Bondfire backend, authentication, storage, authorization, encryption, and generic module implementations with their current Bondfire V3 equivalents.

Do not port the legacy `functions/`, D1 schema, auth handlers, generic org/module pages, service worker behavior, or old security implementation as production code. They are reference material only.

## Red Harbor identity

- Legacy org alias/slug: `red-harbor`
- Public organization site: `https://redharbor.org`
- Private organization workspace: hosted by current Bondfire V3 at `https://bondfireapp.org`
- Publication surface candidate: `https://bulletin.redharbor.org`
- Branch contact: `redharboriww@gmail.com`
- IWW membership signup: `https://redcard.iww.org/`

In V3, `red-harbor` should be treated as a stable public alias/slug and resolved to Red Harbor's canonical V3 organization UUID. The frontend must not depend on the literal string `red-harbor` being a database primary key.

## Public routes to preserve

- `/` — Red Harbor homepage and inline public-site editor
- `/membership` — Red Harbor/IWW membership page
- `/labor-history` — Harbor labor-history archive
- `/bulletin` — public bulletin index
- `/bulletin/:slug` — public bulletin article

The private `Branch Board` name and Red Harbor-specific private-shell terminology should also be preserved where they can be layered onto V3 without replacing V3 module implementations.

## Frontend/content to carry forward

See `manifest.json` for the machine-readable list. The critical source is the Red Harbor homepage, membership page, labor-history archive, bulletin presentation, Red Harbor/branch-board styles, logos/hero imagery, homepage archive images, and the full historical archive asset corpus.

The current homepage deliberately contains its own defaults and normalization logic. Preserve those defaults unless a V3-backed saved value overrides them.

## Legacy service contracts that need V3 adapters

The existing Red Harbor homepage currently calls:

- `GET /api/public-home/red-harbor`
- `GET /api/public/bulletin?org=red-harbor&limit=...`
- `GET /api/auth/me`
- `POST /api/p/red-harbor/newsletter/subscribe`
- `POST /api/orgs/:orgId/public/save`

Bulletin article pages also try:

- `GET /api/public/bulletin/:slug?org=red-harbor`
- `GET /api/public/bulletin/:slug`

These URLs describe required capabilities, not required V3 endpoint names. During the V3 graft, adapt the Red Harbor frontend to current V3 APIs instead of recreating obsolete handlers simply to keep the old URLs alive.

### Required homepage read shape

The public-home read path must ultimately provide an object equivalent to:

```json
{
  "ok": true,
  "public": {
    "branch_label": "...",
    "hero_headline": "...",
    "hero_text": "...",
    "about_intro": "...",
    "purpose_title": "...",
    "about_title": "...",
    "join_title": "...",
    "bulletin_title": "...",
    "events_title": "...",
    "contact_title": "...",
    "hero_image_url": "...",
    "font_family": "system",
    "accent_color": "#a11f1f",
    "what_we_do": [],
    "site_purpose_items": [],
    "join_cards": [],
    "events_items": [],
    "primary_actions": [],
    "get_involved_links": [],
    "section_order": [],
    "section_visibility": {}
  }
}
```

The actual homepage has additional membership/card/visibility fields. Preserve the complete payload defined by `src/pages/RedHarborHome.jsx` and the legacy save normalizer while mapping persistence to V3.

## V3 requirements

When this frontend is grafted into `BondfireApp/Bondfire`:

1. Use current V3 session/authentication and server-side authorization. Do not restore the legacy write-lock authorization shortcut.
2. Use the canonical V3 organization UUID internally and preserve `red-harbor` only as the public alias/slug.
3. Keep private organization content on the current V3 encrypted/ciphertext-authoritative path.
4. Bind all publication/Bulletin data to the Red Harbor organization. No globally shared publication rows.
5. Use V3 custom-domain handling so `redharbor.org` resolves directly to Red Harbor's public organization surface.
6. Keep member authentication on the Bondfire application domain unless the V3 deployment deliberately supports a secure custom-domain auth flow.
7. Preserve Red Harbor's public pages and styling rather than replacing them with the generic V3 Organization Page UI.
8. Preserve the labor-history archive as public static content/assets.
9. Treat old generic module code as disposable. V3 owns Meetings, Drive, Needs, Inventory, FireChat, REC, Events, Intake, Colophon, Security, and related backend behavior.
10. Run current V3 tests/builds plus Red Harbor public-route regression checks before deployment.

## Cutover definition

The migration is complete when `redharbor.org` renders the preserved Red Harbor frontend, public editing persists through V3, public Bulletin/Colophon content is Red Harbor-org scoped, member sign-in lands in the Red Harbor V3 workspace, and the legacy Red Harbor backend is no longer required for any live request.
