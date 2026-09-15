Bondfire
========

Bondfire is the React + Vite frontend and Cloudflare Pages Functions backend for the Bondfire coordination platform.

Release validation:

  npm install --no-audit --no-fund
  npm test
  npm run smoke:thread1
  npm run build

Node.js 24 or newer is required by the current release test suite.

Deployment documentation:
- Hosted / support configuration: docs/SUPPORT_DEPLOYMENT.md
- Self-hosting, bindings, D1 setup, upgrades, and backups: docs/SELF_HOSTING.md

Production builds are written to dist/.
