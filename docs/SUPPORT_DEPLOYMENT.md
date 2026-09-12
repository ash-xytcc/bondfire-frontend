# Bondfire Support deployment configuration

Bondfire's in-app Support screen separates public bug/feature reports from private support.

- `Bug` and `Feature request` are created as public GitHub issues in `ash-xytcc/bondfire-frontend` by the server-side Pages Function.
- `Account problem` and `Other` are delivered privately through a Cloudflare Email Service `send_email` binding.
- The browser never receives the GitHub token or the private support destination.

## Required server-side configuration

### GitHub issue creation

Set this Cloudflare secret on the Bondfire Pages/Workers deployment:

- `GITHUB_SUPPORT_TOKEN` — fine-grained GitHub token with **Issues: Read and write** access to `ash-xytcc/bondfire-frontend` only.

Optional server-side variable:

- `SUPPORT_GITHUB_REPOSITORY` — defaults to `ash-xytcc/bondfire-frontend`.

Do not use a `VITE_` variable for the token. Do not put it in `.env`, `.env.production`, frontend JavaScript, localStorage, or any committed file.

### Hosted Bondfire email

Hosted Bondfire uses these public addresses:

- `support@bondfireapp.org`
- `info@bondfireapp.org`
- `security@bondfireapp.org`

For the Support form, configure:

- `BONDFIRE_DEPLOYMENT_MODE=hosted`
- `SUPPORT_PUBLIC_EMAIL=support@bondfireapp.org` (optional for hosted mode because this is the built-in hosted default)
- `SUPPORT_FROM_EMAIL=support@bondfireapp.org` (optional when it is the same as the public support address)
- `SUPPORT_PRIVATE_TO` — the verified private destination inbox. Keep this server-side; it is not returned to the browser.
- `SUPPORT_EMAIL` — Cloudflare Email Service `send_email` binding used by the Pages Function.

`SUPPORT_PRIVATE_TO` may be the mailbox/forwarding destination behind `support@bondfireapp.org`, but it does not need to be publicly disclosed.

### Self-hosted Bondfire

Self-hosted installations must configure their own support identity and destination:

- `BONDFIRE_DEPLOYMENT_MODE=self-hosted`
- `SUPPORT_PUBLIC_EMAIL=support@example.org`
- `SUPPORT_FROM_EMAIL=support@example.org`
- `SUPPORT_PRIVATE_TO=<verified private destination>`
- `SUPPORT_EMAIL=<send_email binding named SUPPORT_EMAIL>`

A self-hosted deployment does not fall back to `support@bondfireapp.org` when `BONDFIRE_DEPLOYMENT_MODE=self-hosted`.

## Cloudflare Email Service setup

Cloudflare Email Service requires the sending domain to be onboarded before a Worker/Pages Function can send mail.

1. In Cloudflare, open **Compute > Email Service > Email Sending** and onboard `bondfireapp.org`.
2. Allow Cloudflare to create/verify the required SPF, DKIM, bounce-domain, and DMARC records for the sending domain.
3. Verify the private destination inbox that will receive support submissions.
4. Add a `send_email` binding named `SUPPORT_EMAIL` to the Bondfire deployment. Restrict it to the private destination and the support sender when the deployment UI/config supports those restrictions.
5. Set `SUPPORT_PRIVATE_TO` to that verified private destination.
6. Redeploy after changing bindings or environment variables.

Equivalent Wrangler configuration, if this deployment is later moved to a Wrangler-managed configuration, is conceptually:

```jsonc
{
  "send_email": [
    {
      "name": "SUPPORT_EMAIL",
      "destination_address": "<private verified destination>",
      "allowed_sender_addresses": ["support@bondfireapp.org"]
    }
  ]
}
```

Do not commit the real private destination if it is intended to remain private. Keep the destination restriction/configuration in Cloudflare and set `SUPPORT_PRIVATE_TO` server-side.

## Inbound public addresses

Configure Cloudflare Email Routing rules for:

- `support@bondfireapp.org`
- `info@bondfireapp.org`
- `security@bondfireapp.org`

Each address can forward to the appropriate verified private destination. These routing rules are independent from the in-app Support form but make the canonical public addresses usable for direct email as well.

## Retry/idempotency behavior

The Support API stores only support-delivery metadata in the existing D1 database. It does **not** persist the report description, reply email, or diagnostic payload in the support idempotency table.

For public GitHub reports, the API:

1. uses the browser-generated support request ID as an idempotency key;
2. checks D1 for an already completed request;
3. checks GitHub for an existing hidden support-request marker before creating an issue;
4. stores the resulting issue number/link after success.

This prevents ordinary double-clicks and retries from intentionally creating duplicate GitHub issues.

## Verification

After deployment:

1. Open an authenticated organization and confirm the compact header shows the Settings gear and hamburger at desktop and mobile widths.
2. Confirm only enabled modules appear under **MODULES**.
3. Submit a `Bug` report and verify the returned GitHub issue contains no reply email or organization ID/name.
4. Retry the same completed submission and verify the same issue number is returned.
5. Submit an `Account problem` and verify it arrives at the configured private destination and does not create a GitHub issue.
6. Confirm the existing floating contextual Help control still functions independently.
