# Bondfire Red Harbor Bootstrap

This is a **starter scaffold** for the IWW Red Harbor instance.

Important truth, because software enjoys being annoying: I could not directly read your GitHub repo from this environment, so this zip is a **drop-in starter package** you can merge into your repo or compare against it. It is designed to get you moving immediately instead of waiting around for the repo gods to stop sulking.

## What is included

- `apps/redharbor-web` — public website starter
- `apps/redharbor-ops` — private ops shell starter
- `workers/api` — tiny API skeleton
- `db/migrations/001_initial_redharbor.sql` — first-pass schema

## Fastest start

1. Unzip this into the root of your Bondfire repo.
2. Run `npm install` from the repo root.
3. Run `npm run dev:web` for the public site.
4. In another terminal, run `npm run dev:ops` for the private ops app.
5. Merge these app folders into your real Bondfire routing/layout structure.
6. Wire forms and pages to your actual backend/storage/auth stack.

## What this is good for right now

- public IA locked in
- private ops IA locked in
- route/module names locked in
- first database schema sketched
- enough UI shell to start replacing placeholder content immediately

## What still needs wiring

- real auth/session handling
- real DB persistence
- actual file uploads
- newsletter sending
- settings persistence
- repo-specific integration into your existing architecture

## Suggested next move

Upload this zip into your repo, then have me generate the **next patch zip** once you show me your actual repo tree or upload the current project files. That way I can stop designing in the dark like some trench-coated raccoon.
