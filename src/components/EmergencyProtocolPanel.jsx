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

function stepForStage(stage, lockdown, isolated) {
  if (stage === 'prepared') return 5;
  if (stage === 'isolated' || isolated) return 3;
  if (stage === 'lockdown' || lockdown) return 2;
  return 0;
}

export default function EmergencyProtocolPanel({ orgId, lockdown = false, isolated = false, onChanged }) {
  const [step, setStep] = React.useState(stepForStage('normal', lockdown, isolated));
  const [preview, setPreview] = React.useState(null);
  const [password, setPassword] = React.useState('');
  const [mfaCode, setMfaCode] = React.useState('');
  const [prepareConfirmation, setPrepareConfirmation] = React.useState('');
  const [confirmation, setConfirmation] = React.useState('');
  const [acknowledgeHistoricalLimit, setAcknowledgeHistoricalLimit] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');

  const loadProtocol = React.useCallback(async () => {
    if (!orgId) return null;
    const result = await api(`/api/orgs/${orgId}/emergency/protocol`, { method: 'GET' });
    setPreview(result?.preview || null);
    const stage = String(result?.protocol?.stage || 'normal');
    setStep(stepForStage(stage, lockdown, result?.protocol?.isolated || isolated));
    return result;
  }, [orgId, lockdown, isolated]);

  React.useEffect(() => {
    loadProtocol().catch(() => {
      setStep(stepForStage('normal', lockdown, isolated));
    });
  }, [loadProtocol, lockdown, isolated]);

  async function enableLockdown() {
    setBusy(true);
    setError('');
    try {
      await api(`/api/orgs/${orgId}/emergency/lockdown`, {
        method: 'POST',
        body: JSON.stringify({ enabled: true, reason: 'Emergency protocol' }),
      });
      await loadProtocol();
      setStep(2);
      onChanged?.();
    } catch (err) {
      setError(err?.message || 'Lockdown failed');
    } finally {
      setBusy(false);
    }
  }

  async function disableLockdown() {
    setBusy(true);
    setError('');
    try {
      await api(`/api/orgs/${orgId}/emergency/lockdown`, {
        method: 'POST',
        body: JSON.stringify({ enabled: false, reason: 'Emergency protocol cancelled' }),
      });
      setPreview(null);
      setStep(0);
      onChanged?.();
    } catch (err) {
      setError(err?.message || 'Could not disable lockdown');
    } finally {
      setBusy(false);
    }
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
      await loadProtocol();
      setStep(3);
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
      setPrepareConfirmation('');
      setConfirmation('');
      setAcknowledgeHistoricalLimit(false);
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
      const result = await loadProtocol();
      setPreview(result?.preview || null);
      setStep(4);
    } catch (err) {
      setError(err?.message || 'Could not load destruction preview');
    } finally {
      setBusy(false);
    }
  }

  async function prepareDestruction() {
    if (!preview?.org?.name) return;
    setBusy(true);
    setError('');
    try {
      const result = await api(`/api/orgs/${orgId}/emergency/prepare`, {
        method: 'POST',
        body: JSON.stringify({
          password,
          mfaCode,
          confirmation: prepareConfirmation,
        }),
      });
      setPreview(result?.preview || preview);
      setPassword('');
      setMfaCode('');
      setPrepareConfirmation('');
      setStep(5);
      onChanged?.();
    } catch (err) {
      setError(err?.message || 'Could not prepare destruction');
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

  const panelStyle = step >= 6
    ? { ...basePanel, borderColor: '#ff4d4d', background: '#3a0505', boxShadow: '0 0 0 2px rgba(255,0,0,0.12)' }
    : step >= 5
      ? { ...basePanel, borderColor: '#ef4444', background: '#350706' }
      : step >= 4
        ? { ...basePanel, borderColor: '#d43b2f', background: '#2d0b09' }
        : step >= 3
          ? { ...basePanel, borderColor: '#b33a24', background: '#2b120d' }
          : step >= 2
            ? { ...basePanel, borderColor: '#a5631e', background: '#2d170d' }
            : basePanel;

  const preparePhrase = preview?.org?.name ? `PREPARE ${String(preview.org.name).trim()}` : '';

  return (
    <section style={panelStyle} aria-labelledby="emergency-protocol-title">
      <h3 id="emergency-protocol-title" style={{ marginTop: 0 }}>Emergency protocol</h3>

      {step === 0 ? (
        <>
          <p style={{ maxWidth: 720 }}>
            This is the deliberate emergency path. It begins with a recoverable write lockdown, then owner-only isolation. Permanent destruction stays unavailable until the recoverable stages and a separate preparation step are complete.
          </p>
          <button onClick={() => setStep(1)}>Enter emergency protocol</button>
        </>
      ) : null}

      {step === 1 ? (
        <>
          <h4>Stage 1 · lockdown</h4>
          <p style={{ maxWidth: 720 }}>
            Lockdown freezes organization write actions while preserving members, data, files, and recovery material. Nothing is deleted and normal access can be restored immediately.
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
            <button disabled={busy} onClick={enableLockdown}>{busy ? 'Locking down…' : 'Enable recoverable lockdown'}</button>
            <button disabled={busy} onClick={() => setStep(0)}>Cancel</button>
          </div>
        </>
      ) : null}

      {step === 2 ? (
        <>
          <h4>Stage 2 · lockdown active</h4>
          <p style={{ maxWidth: 720 }}>
            Writes are frozen and all organization data is still present. You can stop here and restore normal operation, or authenticate again to isolate the organization to owner-only access.
          </p>
          <Credentials password={password} setPassword={setPassword} mfaCode={mfaCode} setMfaCode={setMfaCode} />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
            <button disabled={busy} onClick={disableLockdown}>{busy ? 'Working…' : 'Restore normal operation'}</button>
            <button disabled={busy || !password} onClick={isolateOrg}>{busy ? 'Isolating…' : 'Continue to owner-only isolation'}</button>
          </div>
        </>
      ) : null}

      {step === 3 ? (
        <>
          <h4>Stage 3 · isolation active</h4>
          <p style={{ maxWidth: 720 }}>
            The organization is frozen and non-owner API access is denied. Data is still preserved. You can recover the organization from here or continue to a destruction review that deletes nothing.
          </p>
          <Credentials password={password} setPassword={setPassword} mfaCode={mfaCode} setMfaCode={setMfaCode} />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
            <button disabled={busy || !password} onClick={recoverOrg}>{busy ? 'Working…' : 'Recover organization'}</button>
            <button disabled={busy} onClick={reviewDestruction}>Review permanent destruction</button>
          </div>
        </>
      ) : null}

      {step === 4 ? (
        <>
          <h4>Stage 4 · destruction review</h4>
          <p>This step deletes nothing. It shows the exact active scope before the protocol can be armed for destruction.</p>
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
            Bondfire can delete active organization data, storage objects, memberships, recovery material, and encryption-key records. Legacy plaintext may still exist in provider-managed historical backups outside Bondfire control. Key-protected data becomes unrecoverable when its keys are destroyed.
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
            <button disabled={busy} onClick={() => setStep(3)}>Back to recoverable isolation</button>
            <button disabled={busy || !preview} onClick={() => setStep(5)}>Continue to destruction preparation</button>
          </div>
        </>
      ) : null}

      {step === 5 ? (
        <>
          <h4>Stage 5 · prepare destruction</h4>
          <p style={{ maxWidth: 720 }}>
            This still deletes nothing. Preparing the organization records your deliberate intent and unlocks the final destructive action. You can still recover instead.
          </p>
          <p>Type <code>{preparePhrase || 'PREPARE …'}</code> exactly.</p>
          <input
            value={prepareConfirmation}
            onChange={(event) => setPrepareConfirmation(event.target.value)}
            placeholder={preparePhrase || 'Preparation phrase'}
            style={fieldStyle}
          />
          <Credentials password={password} setPassword={setPassword} mfaCode={mfaCode} setMfaCode={setMfaCode} />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
            <button disabled={busy || !password} onClick={recoverOrg}>Recover organization instead</button>
            <button
              disabled={busy || !password || !preparePhrase || prepareConfirmation !== preparePhrase}
              onClick={prepareDestruction}
            >
              {busy ? 'Preparing…' : 'Prepare permanent destruction'}
            </button>
          </div>
          {preview?.confirmationPhrase && !prepareConfirmation ? (
            <button disabled={busy} onClick={() => setStep(4)} style={{ marginTop: 8 }}>Back to review</button>
          ) : null}
        </>
      ) : null}

      {step === 6 || (step === 5 && preview && !preparePhrase) ? null : null}

      {step === 5 && preview?.confirmationPhrase && preparePhrase === '' ? null : null}

      {step === 5 && false ? null : null}

      {step === 5 ? null : null}

      {step === 6 ? (
        <>
          <h4>Stage 6 · irreversible destruction</h4>
          <p style={{ fontWeight: 700 }}>
            After this succeeds, Bondfire has no restore path for the organization. Memberships, active data, Drive objects, and key/recovery material are destroyed.
          </p>
          <p>Type <code>{preview?.confirmationPhrase || 'DESTROY …'}</code> exactly.</p>
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
            <button disabled={busy || !password} onClick={recoverOrg}>Recover organization instead</button>
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
