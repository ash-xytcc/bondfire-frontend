import React from 'react';
import { api } from '../utils/api.js';

const basePanel = {
  marginTop: 16,
  padding: 16,
  borderRadius: 12,
  border: '1px solid #8a4b18',
  background: '#2d1b0f',
  color: '#fff7ed',
};

const fieldStyle = {
  width: '100%',
  maxWidth: 520,
  boxSizing: 'border-box',
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid rgba(255,255,255,0.35)',
  background: 'rgba(0,0,0,0.28)',
  color: 'inherit',
};

function Credentials({ password, setPassword, mfaCode, setMfaCode }) {
  return (
    <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
      <input
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="Current password"
        style={fieldStyle}
      />
      <input
        inputMode="numeric"
        autoComplete="one-time-code"
        value={mfaCode}
        onChange={(event) => setMfaCode(event.target.value)}
        placeholder="MFA code, if enabled"
        style={fieldStyle}
      />
    </div>
  );
}

function cleanClientOrgKey(orgId) {
  try {
    localStorage.removeItem(`bf_orgkey_cache_v1:${orgId}`);
  } catch {}
}

export default function EmergencyProtocolPanel({ orgId, isolated = false, onChanged }) {
  const [step, setStep] = React.useState(isolated ? 2 : 0);
  const [preview, setPreview] = React.useState(null);
  const [password, setPassword] = React.useState('');
  const [mfaCode, setMfaCode] = React.useState('');
  const [confirmation, setConfirmation] = React.useState('');
  const [acknowledgeHistoricalLimit, setAcknowledgeHistoricalLimit] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    if (isolated && step < 2) setStep(2);
  }, [isolated, step]);

  async function loadPreview() {
    const result = await api(`/api/orgs/${orgId}/emergency/protocol`, { method: 'GET' });
    setPreview(result?.preview || null);
    return result?.preview || null;
  }

  async function isolateOrg() {
    setBusy(true);
    setError('');
    try {
      await api(`/api/orgs/${orgId}/emergency/isolate`, {
        method: 'POST',
        body: JSON.stringify({ password, mfaCode }),
      });
      setPassword('');
      setMfaCode('');
      await loadPreview();
      setStep(2);
      onChanged?.();
    } catch (err) {
      setError(err?.message || 'Isolation failed');
    } finally {
      setBusy(false);
    }
  }

  async function recoverOrg() {
    setBusy(true);
    setError('');
    try {
      await api(`/api/orgs/${orgId}/emergency/recover`, {
        method: 'POST',
        body: JSON.stringify({ password, mfaCode }),
      });
      setPassword('');
      setMfaCode('');
      setPreview(null);
      setStep(0);
      onChanged?.();
    } catch (err) {
      setError(err?.message || 'Recovery failed');
    } finally {
      setBusy(false);
    }
  }

  async function reviewDestruction() {
    setBusy(true);
    setError('');
    try {
      await loadPreview();
      setStep(3);
    } catch (err) {
      setError(err?.message || 'Could not load destruction preview');
    } finally {
      setBusy(false);
    }
  }

  async function destroyOrg() {
    if (!preview?.confirmationPhrase) return;
    setBusy(true);
    setError('');
    try {
      await api(`/api/orgs/${orgId}/emergency/destroy`, {
        method: 'POST',
        body: JSON.stringify({
          password,
          mfaCode,
          confirmation,
          acknowledgeHistoricalLimit,
        }),
      });
      cleanClientOrgKey(orgId);
      window.location.assign('/');
    } catch (err) {
      setError(err?.message || 'Destruction failed');
      setBusy(false);
    }
  }

  const panelStyle = step >= 4
    ? { ...basePanel, borderColor: '#ff4d4d', background: '#3a0505', boxShadow: '0 0 0 2px rgba(255,0,0,0.12)' }
    : step >= 3
      ? { ...basePanel, borderColor: '#d43b2f', background: '#2d0b09' }
      : step >= 2
        ? { ...basePanel, borderColor: '#b33a24', background: '#2b120d' }
        : basePanel;

  return (
    <section style={panelStyle} aria-labelledby="emergency-protocol-title">
      <h3 id="emergency-protocol-title" style={{ marginTop: 0 }}>Emergency protocol</h3>

      {step === 0 ? (
        <>
          <p style={{ maxWidth: 720 }}>
            This is the deliberate emergency path. It begins with recoverable lockdown and isolation. Permanent destruction only appears after you move through the warning stages.
          </p>
          <button onClick={() => setStep(1)}>Enter emergency protocol</button>
        </>
      ) : null}

      {step === 1 ? (
        <>
          <h4>Stage 1 · isolate the organization</h4>
          <p style={{ maxWidth: 720 }}>
            Isolation enables lockdown and immediately denies every non-owner access through the Bondfire API. Data is preserved. The owner can still recover the organization from this screen.
          </p>
          <Credentials password={password} setPassword={setPassword} mfaCode={mfaCode} setMfaCode={setMfaCode} />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
            <button disabled={busy || !password} onClick={isolateOrg}>{busy ? 'Isolating…' : 'Isolate organization'}</button>
            <button disabled={busy} onClick={() => setStep(0)}>Cancel</button>
          </div>
        </>
      ) : null}

      {step === 2 ? (
        <>
          <h4>Stage 2 · isolation active</h4>
          <p style={{ maxWidth: 720 }}>
            The organization is frozen and non-owner access is denied. This is still recoverable. You can stop here, restore access, or continue into permanent destruction review.
          </p>
          <Credentials password={password} setPassword={setPassword} mfaCode={mfaCode} setMfaCode={setMfaCode} />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
            <button disabled={busy || !password} onClick={recoverOrg}>{busy ? 'Working…' : 'Recover organization'}</button>
            <button disabled={busy} onClick={reviewDestruction}>Review permanent destruction</button>
          </div>
        </>
      ) : null}

      {step === 3 ? (
        <>
          <h4>Stage 3 · destruction review</h4>
          <p>This step deletes nothing. It shows the scope before the point of no return.</p>
          {preview ? (
            <div style={{ display: 'grid', gap: 5, margin: '12px 0' }}>
              <div><strong>Organization:</strong> {preview.org?.name || orgId}</div>
              <div><strong>Members removed:</strong> {preview.memberCount ?? 0}</div>
              <div><strong>Database rows targeted:</strong> {preview.totalRows ?? 0}</div>
              <div><strong>Drive objects targeted:</strong> {preview.driveObjectCount ?? 0}</div>
              <div><strong>Key material rows targeted:</strong> {preview.keyMaterialRows ?? 0}</div>
            </div>
          ) : null}
          <div style={{ padding: 10, border: '1px solid #d9897e', borderRadius: 8, background: 'rgba(0,0,0,0.2)' }}>
            Bondfire deletes active organization data, storage objects, memberships, recovery material, and encryption-key records. Legacy plaintext may still exist in provider-managed historical backups outside Bondfire control. Key-protected data becomes unrecoverable when its keys are destroyed.
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
            <button disabled={busy} onClick={() => setStep(2)}>Back to recoverable isolation</button>
            <button disabled={busy || !preview} onClick={() => setStep(4)}>Continue to irreversible destruction</button>
          </div>
        </>
      ) : null}

      {step === 4 ? (
        <>
          <h4>Stage 4 · irreversible destruction</h4>
          <p style={{ fontWeight: 700 }}>
            After this succeeds, Bondfire has no restore path for the organization. Memberships, active data, Drive objects, and key/recovery material are destroyed.
          </p>
          <p>
            Type <code>{preview?.confirmationPhrase || 'DESTROY …'}</code> exactly.
          </p>
          <input
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            placeholder={preview?.confirmationPhrase || 'Confirmation phrase'}
            style={fieldStyle}
          />
          <Credentials password={password} setPassword={setPassword} mfaCode={mfaCode} setMfaCode={setMfaCode} />
          <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginTop: 12, maxWidth: 720 }}>
            <input
              type="checkbox"
              checked={acknowledgeHistoricalLimit}
              onChange={(event) => setAcknowledgeHistoricalLimit(event.target.checked)}
            />
            <span>I understand the provider-history limitation for legacy plaintext and still want Bondfire to destroy all active organization data and cryptographic recovery material now.</span>
          </label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
            <button disabled={busy} onClick={() => setStep(3)}>Back</button>
            <button
              disabled={busy || !password || !acknowledgeHistoricalLimit || confirmation !== preview?.confirmationPhrase}
              onClick={destroyOrg}
              style={{ fontWeight: 800 }}
            >
              {busy ? 'Destroying…' : 'Destroy organization permanently'}
            </button>
          </div>
        </>
      ) : null}

      {error ? <div style={{ marginTop: 12, padding: 10, borderRadius: 8, background: 'rgba(0,0,0,0.28)' }}>{error}</div> : null}
    </section>
  );
}
