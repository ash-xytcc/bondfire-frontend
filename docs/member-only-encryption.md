# Member-only encrypted organizations

This is an explicit organization mode. It is **not a claim that every existing
Bondfire organization, module, database row, or provider backup is zero knowledge**.
Existing organizations retain their current storage behavior until an owner
completes the conversion from Settings → Security on a device with the correct key.
The dashboard also offers creation of a new encrypted organization; its name is
encrypted before the creation request.

## Content boundary

The private API stores AES-256-GCM ciphertext produced on member devices. Record
identity and organization identity are authenticated as additional data, so an
envelope cannot be copied to another organization or record and successfully
opened. Random 96-bit IVs are generated for each encryption. File names and MIME
types are inside encrypted metadata; file contents are encrypted separately before
upload to R2 or the small-file D1 fallback. Updates use revision checks.

The server has no unwrapped content key. ECDH P-256, HKDF-SHA-256 and AES-GCM wrap
the organization key for registered member devices. Device wraps are separate so
sharing with another device does not replace the first device's wrap. Recovery is
an independently passphrase-encrypted copy; new private organizations require a
separate recovery passphrase. Password reset does not recover encrypted content.

Access is checked against current accounts and organization roles on every API
request. Removing membership deletes that member's server-side key wraps and
recovery copy. Previously obtained keys, plaintext, and downloads cannot be
recalled. The shared organization content key does not provide cryptographic
compartmentalization between members; endpoint role checks govern retrieval.

## Available surfaces

Private storage supports organization names, Needs, Pledges, Inventory, People,
meeting details, Events, Witness record metadata, native chat rooms/messages,
Drive folders/notes/templates/files, and private form/sheet files in Drive.
The private dashboard and navigation expose these surfaces.

Public pages/submissions, newsletter operations, external chat, Colophon,
Studio, RSVP collection, and integrations without a private adapter are not
enabled in this mode. The server rejects unsupported organization routes instead
of falling back to legacy storage. This mode does not convert anonymous REC
capture into an organization recording workflow.

## Existing data

Conversion runs on the owner's device. It decrypts any supported legacy encrypted
record, encrypts and verifies the complete record locally, then atomically stores
the encrypted replacement and scrubs readable fields in the active legacy row.
Compare-and-swap checks stop conversion if a source changed. File conversion
stores encrypted bytes before retiring the original; failed external deletion is
retryable and prevents the conversion from being reported complete.

Unknown plugin tables, unsupported records, existing public-site copies,
unhandled dependent rows, and orphaned file data block conversion. They are not
dropped, silently skipped, or treated as encrypted. A stopped conversion can be
resumed. API writes are frozen during conversion; database write guards also
reject late writes through the supported legacy content tables. Conversion does
not purge provider backups, history, copies already published, or user devices.

## What the server can still observe

Accounts and login identifiers, membership relationships, roles, public device
keys, enabled modules, record kinds and identifiers, parent relationships,
revisions, timestamps, request traffic, and ciphertext sizes remain visible.
Provider/network logs may reveal IP addresses. This is content confidentiality,
not anonymity or a claim that the operator knows nothing about group activity.

The threat model is a server that runs the reviewed client and protocol but can
inspect its storage. A malicious operator serving modified JavaScript or
substituting public keys, a compromised member device, or a member disclosing a
key can defeat confidentiality. This browser implementation has not received an
independent security audit and does not claim protection against those attacks.

## Verification

With Node 24 or another Node release providing `node:sqlite`:

```
node scripts/private-storage-regression.mjs
node scripts/emergency-protocol-regression.mjs
npm run smoke:thread1
npm run build
```

The private regression uses real SQLite transactions and Web Crypto. It covers
role checks, plaintext rejection, record identity binding, tamper rejection,
revision conflicts, late legacy writes, file ciphertext, source-change rejection,
transaction rollback, and retryable cleanup. Cloudflare Pages Functions bundling
must also pass before deployment. A successful build is not verification that a
live organization's data has been converted.
