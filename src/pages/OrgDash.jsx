// src/pages/OrgDash.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { isDemoMode } from "../demo/demoMode.js";
import { ensureDemoOrgList } from "../demo/demoStore.js";
import { getAppMode } from "../lib/appMode";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

function getToken() {
  return localStorage.getItem("bf_auth_token") || sessionStorage.getItem("bf_auth_token") || "";
}

function readCookie(name) {
  if (typeof document === "undefined") return "";
  const safe = name.replace(/[$()*+.?[\\\]^{|}]/g, "\\$&");
  const m = document.cookie.match(new RegExp(`(?:^|; )${safe}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : "";
}

async function authFetch(path, opts = {}) {
  opts = opts || {};
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
    ...((opts?.headers) || {}),
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
  const isRedHarbor = getAppMode() === "red-harbor";

  const [orgs, setOrgs] = React.useState([]);
  const [busy, setBusy] = React.useState(false);
  const [msg, setMsg] = React.useState("");

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
      setMsg(e.message || "Failed to load branches");
    }
  }, [demoMode]);

  React.useEffect(() => {
    load();
  }, [load]);

  React.useEffect(() => {
    if (!isRedHarbor) return;
    if (!orgs.length) return;
    const first = orgs[0];
    if (first?.id) {
      nav(`/org/${encodeURIComponent(first.id)}`, { replace: true });
    }
  }, [isRedHarbor, orgs, nav]);

  if (!isRedHarbor) {
    return (
      <div style={{ padding: 16 }}>
        <h1 style={{ marginTop: 0 }}>Org Dashboard</h1>
        <p className="helper">This build is not using the legacy org picker.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 16, maxWidth: 980 }}>
      <div className="card" style={{ padding: 20 }}>
        <h1 style={{ marginTop: 0, marginBottom: 10 }}>Branch access</h1>
        <p className="helper" style={{ marginTop: 0 }}>
          This Red Harbor build goes straight into the branch workspace. The old create and join org page is not used here.
        </p>

        {msg ? (
          <div className="helper" style={{ color: "tomato", marginTop: 10 }}>
            {msg}
          </div>
        ) : null}

        {busy ? (
          <div className="helper" style={{ marginTop: 12 }}>Loading…</div>
        ) : null}

        {!busy && orgs.length === 0 ? (
          <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
            <div className="card" style={{ padding: 16 }}>
              <h2 style={{ marginTop: 0 }}>No branch found</h2>
              <p className="helper" style={{ marginTop: 0 }}>
                You are signed in, but no Red Harbor branch workspace was returned for this account.
              </p>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button className="btn" type="button" onClick={load}>
                Refresh
              </button>
              <Link className="btn-red" to="/">
                Go to public homepage
              </Link>
            </div>
          </div>
        ) : null}

        {!busy && orgs.length > 1 ? (
          <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
            <div className="helper">Multiple branch entries were returned. Choose one:</div>
            {orgs.map((o) => (
              <div
                key={o.id}
                className="card"
                style={{
                  padding: 14,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <div style={{ fontWeight: 800 }}>{o.name || o.id}</div>
                  <div className="helper">Role: {o.role || "member"}</div>
                </div>
                <button
                  className="btn-red"
                  type="button"
                  onClick={() => nav(`/org/${encodeURIComponent(o.id)}`)}
                >
                  Enter branch
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
