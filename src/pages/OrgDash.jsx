// src/pages/OrgDash.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { isDemoMode } from "../demo/demoMode.js";
import { ensureDemoOrgList, resetDemoState } from "../demo/demoStore.js";

/* ---------- API helper ---------- */
const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

function useIsMobile(maxWidthPx = 720) {
  const [isMobile, setIsMobile] = React.useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia && window.matchMedia(`(max-width: ${maxWidthPx}px)`).matches;
  });

  React.useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia(`(max-width: ${maxWidthPx}px)`);
    const onChange = () => setIsMobile(mq.matches);
    onChange();
    try {
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    } catch {
      mq.addListener(onChange);
      return () => mq.removeListener(onChange);
    }
  }, [maxWidthPx]);

  return isMobile;
}

function getToken() {
  // Back-compat: older builds stored a JWT in storage.
  // Newer cookie-session builds won't have this, and that's OK.
  return localStorage.getItem("bf_auth_token") || sessionStorage.getItem("bf_auth_token") || "";
}

function readCookie(name) {
  if (typeof document === "undefined") return "";
  const safe = name.replace(/[$()*+.?[\\\]^{|}]/g, "\\$&");
  const m = document.cookie.match(new RegExp(`(?:^|; )${safe}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : "";
}

async function authFetch(path, opts = {}) {
  const token = getToken();
  const relative = path.startsWith("/") ? path : `/${path}`;
  const isAbs = path.startsWith("http");
  const candidates = (() => {
    if (isAbs) return [path];
    if (!API_BASE) return [relative];
    if (relative.startsWith("/api/")) return [relative, `${API_BASE}${relative}`];
    return [`${API_BASE}${relative}`];
  })();

  const headers = {
    "Content-Type": "application/json",
    ...(opts.headers || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const method = String(opts.method || "GET").toUpperCase();
  if (method !== "GET" && method !== "HEAD" && method !== "OPTIONS") {
    const csrf = readCookie("bf_csrf");
    if (csrf && !headers["X-CSRF"] && !headers["x-csrf"]) headers["X-CSRF"] = csrf;
  }

  const doReq = async (u) => {
    const res = await fetch(u, {
      ...opts,
      credentials: "include",
      headers,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok || j.ok === false) throw new Error(j.error || j.message || `HTTP ${res.status}`);
    return j;
  };

  let lastErr = null;
  for (let i = 0; i < candidates.length; i++) {
    const u = candidates[i];
    try {
      return await doReq(u);
    } catch (e) {
      lastErr = e;
      const msg = String(e?.message || "");
      const shouldTryNext = i < candidates.length - 1 && (
        msg.includes("HTTP 404") ||
        msg.includes("HTTP 500") ||
        msg.includes("Failed to fetch")
      );
      if (!shouldTryNext) throw e;
    }
  }

  throw lastErr || new Error("Request failed");
}

export default function OrgDash() {
  const nav = useNavigate();
  const demoMode = isDemoMode();
  const isMobile = useIsMobile(720);

  const [orgs, setOrgs] = React.useState([]);
  const [busy, setBusy] = React.useState(false);
  const [msg, setMsg] = React.useState("");

  const [inviteCode, setInviteCode] = React.useState("");
  const load = React.useCallback(async () => {
    setMsg("");
    try {
      if (demoMode) {
        const demoOrg = ensureDemoOrgList();
        setOrgs([demoOrg]);
        return;
      }
      const r = await authFetch("/api/orgs", { method: "GET" });
      setOrgs(Array.isArray(r.orgs) ? r.orgs : []);
    } catch (e) {
      setMsg(e.message || "Failed to load orgs");
    }
  }, [demoMode]);

  React.useEffect(() => {
    load();
  }, [load]);

  const joinWithInvite = async (e) => {
    e?.preventDefault();
    const code = (inviteCode || "").trim().toUpperCase();
    if (!code) return;
    setBusy(true);
    setMsg("");
    try {
      if (demoMode) {
        setMsg("Invite join is disabled in demo mode.");
        return;
      }
      const r = await authFetch("/api/invites/redeem", { method: "POST", body: { code } });
      setInviteCode("");
      await load();
      if (r?.org?.id) nav(`/org/${encodeURIComponent(r.org.id)}`);
      else setMsg("Joined.");
    } catch (e2) {
      setMsg(e2.message || "Failed to join");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ marginTop: 0 }}>Org Dashboard</h1>
      <p className="helper">Choose an organization to enter its workspace, or create or join one.</p>

      {demoMode ? (
        <div className="card" style={{ padding: 12, marginBottom: 16, background: "rgba(255,255,255,0.03)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <div style={{ fontWeight: 800, flex: 1 }}>Demo Mode is active. Changes are saved only in this browser.</div>
            <button className="btn" type="button" onClick={() => { resetDemoState(); ensureDemoOrgList(); load(); setMsg("Demo reset."); try { window.dispatchEvent(new Event("bf-demo-tour-open")); } catch {} }}>
              Reset Demo
            </button>
          </div>
        </div>
      ) : null}

      <div
        className="grid"
        style={{
          gap: 16,
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
        }}
      >
        <div className="card" style={{ padding: 16 }}>
          <h2 style={{ marginTop: 0 }}>Create a new org</h2>
          <p className="helper" style={{ lineHeight: 1.55 }}>
            Choose the modules first, then name the organization and bring it into the room.
          </p>
          <button
            className="btn-red"
            type="button"
            onClick={() => nav("/build?new=1")}
            disabled={busy}
          >
            Build a new org
          </button>
        </div>

        <div className="card" style={{ padding: 16 }}>
          <h2 style={{ marginTop: 0 }}>Join with an invite code</h2>
          <form onSubmit={joinWithInvite} className="grid" style={{ gap: 10 }}>
            <label className="grid" style={{ gap: 6 }}>
              <span className="helper">Invite code</span>
              <input
                className="input"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="Paste invite code"
                autoCapitalize="characters"
                autoCorrect="off"
              />
            </label>
            <button className="btn-red" disabled={busy || !inviteCode.trim()}>
              Join
            </button>
          </form>
        </div>
      </div>

      <div className="card" style={{ padding: 16, marginTop: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <h2 style={{ margin: 0, flex: 1, minWidth: 140 }}>Your orgs</h2>
          <button className="btn" style={{ whiteSpace: "nowrap" }} onClick={load} disabled={busy}>
            Refresh
          </button>
        </div>

        {msg && (
          <div className={msg.toLowerCase().includes("fail") ? "error" : "helper"} style={{ marginTop: 10 }}>
            {msg}
          </div>
        )}

        {orgs.length === 0 ? (
          <div className="helper" style={{ marginTop: 12 }}>No orgs yet.</div>
        ) : (
          <div style={{ marginTop: 12 }}>
            {orgs.map((o) => (
              <div
                key={o.id}
                className="row"
                style={{
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 0",
                  borderTop: "1px solid #222",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis" }}>
                    {o.name || o.id}
                  </div>
                  <div className="helper">Role: {o.role || "member"}</div>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <button
                    className="btn-red"
                    data-tour="demo-org-open"
                    style={{ whiteSpace: "nowrap" }}
                    onClick={() => nav(`/org/${encodeURIComponent(o.id)}`)}
                    disabled={busy}
                  >
                    Open
                  </button>
                  {['owner', 'admin'].includes(o.role) ? (
                    <button className="btn" disabled={busy} onClick={() => nav(`/org/${encodeURIComponent(o.id)}/settings?tab=security`)}>
                      Security
                    </button>
                  ) : null}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
