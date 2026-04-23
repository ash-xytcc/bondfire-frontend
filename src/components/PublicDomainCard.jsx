import { useEffect, useMemo, useState } from 'react'
import { fetchPublicSiteDomainState, savePublicSiteDomainState } from '../lib/publicSiteDomainsApi'

function DomainRow({ domain, onPrimary, onVerify, onRemove, busy }) {
  return (
    <article className="admin-card">
      <div className="admin-card__eyebrow">mapped domain</div>
      <h2>{domain.hostname}</h2>
      <p>
        status: {domain.verificationStatus}
        {domain.isPrimary ? ' · primary' : ''}
      </p>
      <p style={{ wordBreak: 'break-all' }}>
        verification token: {domain.verificationToken || 'pending generation'}
      </p>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        {!domain.isPrimary ? (
          <button className="button button--primary" type="button" onClick={() => onPrimary(domain.hostname)} disabled={busy}>
            make primary
          </button>
        ) : null}
        {domain.verificationStatus !== 'verified' ? (
          <button className="button" type="button" onClick={() => onVerify(domain.hostname)} disabled={busy}>
            mark verified
          </button>
        ) : null}
        <button className="button" type="button" onClick={() => onRemove(domain.hostname)} disabled={busy}>
          remove
        </button>
      </div>
    </article>
  )
}

export function PublicDomainCard() {
  const [state, setState] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [newDomain, setNewDomain] = useState('')
  const [siteSlug, setSiteSlug] = useState('main')

  async function refresh() {
    try {
      setLoading(true)
      setError('')
      const next = await fetchPublicSiteDomainState()
      setState(next)
      setSiteSlug(next?.siteSlug || 'main')
    } catch (err) {
      setError(String(err?.message || err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  async function save(payload) {
    try {
      setSaving(true)
      setError('')
      const next = await savePublicSiteDomainState(payload)
      setState(next)
      setSiteSlug(next?.siteSlug || 'main')
      setNewDomain('')
    } catch (err) {
      setError(String(err?.message || err))
    } finally {
      setSaving(false)
    }
  }

  const slugPath = useMemo(() => state?.slugPath || `/site/${siteSlug || 'main'}`, [state, siteSlug])

  return (
    <>
      <section className="admin-card">
        <div className="admin-card__eyebrow">public domain setup</div>
        <h2>Slug and domain routing</h2>
        <p>
          This stores public slug and custom domain mapping state inside the repo boundary. Actual DNS verification and deploy host binding still require infrastructure outside this codebase.
        </p>

        {error ? <p className="review-card__excerpt">{error}</p> : null}

        <div className="archive-controls">
          <label className="archive-control">
            <span>public site slug</span>
            <input value={siteSlug} onChange={(event) => setSiteSlug(event.target.value)} placeholder="main" />
          </label>
          <div style={{ display: 'flex', alignItems: 'end' }}>
            <button className="button button--primary" type="button" onClick={() => save({ siteSlug })} disabled={saving || loading}>
              save slug
            </button>
          </div>
        </div>

        <p>current slug path: {slugPath}</p>

        <div className="archive-controls">
          <label className="archive-control">
            <span>add custom domain</span>
            <input value={newDomain} onChange={(event) => setNewDomain(event.target.value)} placeholder="example.com" />
          </label>
          <div style={{ display: 'flex', alignItems: 'end' }}>
            <button className="button button--primary" type="button" onClick={() => save({ newDomain })} disabled={saving || loading || !newDomain.trim()}>
              add domain
            </button>
          </div>
        </div>

        <div className="review-summary-card" style={{ marginTop: '1rem' }}>
          <div className="review-summary-card__eyebrow">verification flow</div>
          <ul>
            <li><span>1</span><strong>add the hostname here</strong></li>
            <li><span>2</span><strong>create the TXT or equivalent proof outside the repo using the token</strong></li>
            <li><span>3</span><strong>point the hostname at the real deploy target outside the repo</strong></li>
            <li><span>4</span><strong>mark verified here once real DNS is in place</strong></li>
          </ul>
        </div>
      </section>

      <section className="admin-grid">
        {loading ? <article className="admin-card"><p>loading domains…</p></article> : null}
        {!loading && !state?.domains?.length ? (
          <article className="admin-card">
            <div className="admin-card__eyebrow">mapped domains</div>
            <h2>none yet</h2>
            <p>No custom domains are mapped yet.</p>
          </article>
        ) : null}
        {!loading && state?.domains?.map((domain) => (
          <DomainRow
            key={domain.hostname}
            domain={domain}
            onPrimary={(hostname) => save({ setPrimaryHostname: hostname })}
            onVerify={(hostname) => save({ setVerifiedHostname: hostname, verificationStatus: 'verified' })}
            onRemove={(hostname) => save({ removeHostname: hostname })}
            busy={saving}
          />
        ))}
      </section>
    </>
  )
}
