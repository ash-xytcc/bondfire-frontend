import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isRedHarborMode } from "../lib/appMode";
import "../styles/redharbor.css";

function fireAuthChanged() {
  try {
    window.dispatchEvent(new Event("bf-auth-changed"));
  } catch {}
}

async function safeJson(res) {
  return res.json().catch(() => ({}));
}

function startDemo(navigate) {
  navigate("/demo");
}

export default function SignIn() {
  const navigate = useNavigate();
  const redHarborMode = isRedHarborMode();

  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [mfaStep, setMfaStep] = useState(null);
  const [mfaCode, setMfaCode] = useState("");
  const [mfaRecovery, setMfaRecovery] = useState("");
  const [name, setName] = useState("");
  const [orgName, setOrgName] = useState(redHarborMode ? "" : "Bondfire");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (redHarborMode) {
      document.body.classList.add("rh-body");
      try {
        const savedFont = String(localStorage.getItem("rh_font_family") || "system").trim() || "system";
        document.body.dataset.rhFont = savedFont;
      } catch {
        document.body.dataset.rhFont = "system";
      }
    }
    return () => document.body.classList.remove("rh-body");
  }, [redHarborMode]);

  async function postJson(url, body) {
    const res = await fetch(url, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body || {}),
    });
    const data = await safeJson(res);
    return { res, data };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const url = mode === "register" ? "/api/auth/register" : "/api/auth/login";
      const payload =
        mode === "register"
          ? { email, password: pass, name, orgName }
          : { email, password: pass };

      const { res, data } = await postJson(url, payload);

      if (
        mode === "login" &&
        res.ok &&
        data?.ok &&
        data?.mfa_required &&
        data?.challenge_id
      ) {
        setMfaStep({ challengeId: data.challenge_id, email });
        setBusy(false);
        return;
      }

      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || (mode === "register" ? "Account creation failed" : "Sign in failed"));
      }

      const meRes = await fetch("/api/auth/me", { credentials: "include" });
      const meData = await safeJson(meRes);
      if (!meRes.ok || !meData?.ok) {
        throw new Error("SESSION_NOT_ESTABLISHED");
      }

      if (mode === "register" && data?.org?.id) {
        try {
          localStorage.setItem("bf_orgs", JSON.stringify([data.org]));
        } catch {}
        fireAuthChanged();
        navigate(`/org/${data.org.id}`, { replace: true });
        return;
      }

      const trimmedCode = String(inviteCode || "").trim().toUpperCase();
      if (trimmedCode) {
        const { res: jRes, data: jData } = await postJson("/api/invites/redeem", { code: trimmedCode });
        if (!jRes.ok || !jData?.ok) {
          throw new Error(jData?.error || "Invite code was not accepted");
        }
        if (jData?.org?.id) {
          fireAuthChanged();
          navigate(`/org/${jData.org.id}`, { replace: true });
          return;
        }
      }

      try {
        const orgsRes = await fetch("/api/orgs", { credentials: "include" });
        const orgsData = await safeJson(orgsRes);
        if (orgsRes.ok && orgsData?.ok && Array.isArray(orgsData.orgs)) {
          localStorage.setItem("bf_orgs", JSON.stringify(orgsData.orgs));
        }
      } catch {}

      fireAuthChanged();

      try {
        const orgsRes = await fetch("/api/orgs", { credentials: "include" });
        const orgsData = await orgsRes.json().catch(() => ({}));
        if (orgsRes.ok && orgsData?.ok && Array.isArray(orgsData.orgs) && orgsData.orgs.length > 0) {
          navigate(`/org/${orgsData.orgs[0].id}`, { replace: true });
          return;
        }
      } catch {}

      navigate("/orgs", { replace: true });
    } catch (e2) {
      setErr(typeof e2 === "string" ? e2 : e2?.message || "Auth failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleMfaVerify(e) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const { res, data } = await postJson("/api/auth/login/mfa", {
        challenge_id: mfaStep?.challengeId,
        code: mfaCode,
        recovery_code: mfaRecovery,
      });
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Verification failed");
      }

      const meRes = await fetch("/api/auth/me", { credentials: "include" });
      const meData = await safeJson(meRes);
      if (!meRes.ok || !meData?.ok) {
        throw new Error("SESSION_NOT_ESTABLISHED");
      }

      try {
        const orgsRes = await fetch("/api/orgs", { credentials: "include" });
        const orgsData = await safeJson(orgsRes);
        if (orgsRes.ok && orgsData?.ok && Array.isArray(orgsData.orgs)) {
          localStorage.setItem("bf_orgs", JSON.stringify(orgsData.orgs));
        }
      } catch {}

      setMfaStep(null);
      setMfaCode("");
      setMfaRecovery("");
      fireAuthChanged();
      navigate("/orgs", { replace: true });
    } catch (e2) {
      setErr(typeof e2 === "string" ? e2 : e2?.message || "Verification failed");
    } finally {
      setBusy(false);
    }
  }

  if (!redHarborMode) {
    return (
      <div style={{ maxWidth: 520, margin: "8vh auto", padding: 16 }}>
        <h1 style={{ marginBottom: 6 }}>Welcome to Bondfire</h1>
        <p className="helper" style={{ marginTop: 0 }}>
          {mode === "login" ? "Sign in to continue." : "Create your account and your first org."}
        </p>
      </div>
    );
  }

  return (
    <div className="rh-page">
      <div className="rh-signin-wrap">
        <div className="rh-signin-scene">
          <section className="rh-board">
            <div className="rh-board-grid">
              <div>
                <div className="rh-note">
                  <div className="rh-note-sub">Members and invited organizers</div>
                  <h1 className="rh-note-title">Sign in to the branch</h1>
                  <p className="rh-note-copy">
                    This side of the site is for branch members and trusted working groups. Sign in to
                    reach notes, records, planning, and internal coordination.
                  </p>
                  <ul className="rh-note-list">
                    <li>Meeting notes and branch records</li>
                    <li>Organizing follow up and internal discussion</li>
                    <li>Documents and working materials</li>
                    <li>Member only updates</li>
                  </ul>
                  <a className="rh-btn" href="/?app=red-harbor#/red-harbor">
                    Back to public site
                  </a>
                </div>

                <div className="rh-poster-stack">
                  <div className="rh-mini-note">
                    <h3>Member side</h3>
                    <p>For branch work, planning, follow up, and internal communication.</p>
                  </div>
                  <div className="rh-mini-note">
                    <h3>Need access?</h3>
                    <p>If you were invited in, use your account and optional invite code to enter the branch space.</p>
                  </div>
                </div>
              </div>

              <div>
                <div className="rh-photo-card rh-photo-card-logo">
                  <img
                    src="/red-harbor-logo.png"
                    alt="Red Harbor logo"
                    className="rh-photo-logo"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>

                <div className="rh-poster-stack">
                  <div className="rh-mini-note">
                    <h3>Private branch space</h3>
                    <p>Not indexed, not public, and not meant for outreach copy. This is the working side of the branch.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="rh-metal">
            <div className="rh-metal-header">
              <h2 className="rh-metal-brand">Red Harbor</h2>
              <div className="rh-metal-sub">Member sign in</div>
            </div>

            <div className="rh-auth-head">
              <h1 className="rh-auth-title">
                {mfaStep ? "Verify your sign in" : mode === "register" ? "Create your account" : "Sign in"}
              </h1>
              <p className="rh-auth-copy">
                {mfaStep
                  ? "Enter your authentication code to finish signing in."
                  : mode === "register"
                    ? "Create your account to access the branch workspace."
                    : "Use your email and password to enter the member side of Red Harbor."}
              </p>
            </div>

            <div className="rh-auth-toolbar">
              <button
                type="button"
                className={`rh-btn ${mode === "login" && !mfaStep ? "rh-btn-primary" : ""}`}
                onClick={() => {
                  setErr("");
                  setMode("login");
                }}
                disabled={busy || !!mfaStep}
              >
                Sign in
              </button>
              <button
                type="button"
                className={`rh-btn ${mode === "register" ? "rh-btn-primary" : ""}`}
                onClick={() => {
                  setErr("");
                  setMode("register");
                }}
                disabled={busy || !!mfaStep}
              >
                Create account
              </button>
              <button
                type="button"
                className="rh-btn"
                onClick={() => startDemo(navigate)}
                disabled={busy}
              >
                Try demo
              </button>
            </div>

            {err ? <div className="rh-error">{String(err)}</div> : null}

            {mfaStep ? (
              <form onSubmit={handleMfaVerify} className="rh-auth-form">
                <input
                  className="rh-input"
                  type="text"
                  placeholder="Authentication code"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  autoFocus
                />
                <input
                  className="rh-input"
                  type="text"
                  placeholder="Recovery code"
                  value={mfaRecovery}
                  onChange={(e) => setMfaRecovery(e.target.value)}
                />
                <div className="rh-auth-toolbar">
                  <button className="rh-btn rh-btn-primary" disabled={busy}>
                    {busy ? "Verifying…" : "Verify sign in"}
                  </button>
                  <button
                    type="button"
                    className="rh-btn"
                    disabled={busy}
                    onClick={() => {
                      setMfaStep(null);
                      setMfaCode("");
                      setMfaRecovery("");
                    }}
                  >
                    Back
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="rh-auth-form">
                {mode === "register" ? (
                  <>
                    <input
                      className="rh-input"
                      type="text"
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                    <input
                      className="rh-input"
                      type="text"
                      placeholder="Organization name"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                    />
                  </>
                ) : null}

                <input
                  className="rh-input"
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                />

                <div className="rh-auth-row">
                  <input
                    className="rh-input"
                    type="password"
                    placeholder="Password"
                    value={pass}
                    onChange={(e) => setPass(e.target.value)}
                  />
                  <input
                    className="rh-input"
                    type="text"
                    placeholder="Invite code"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                  />
                </div>

                <button className="rh-btn rh-btn-primary" disabled={busy}>
                  {busy ? "Working…" : mode === "register" ? "Create account" : "Sign in"}
                </button>
              </form>
            )}

            <div className="rh-auth-footer">
              <div className="rh-auth-note">
                Public pages are for outreach. This sign in is for member work and internal branch access.
              </div>
              <a className="rh-btn" href="/?app=red-harbor#/red-harbor">
                Back to public site
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
