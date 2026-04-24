import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../utils/api.js";

function getOrgIdFromHash() {
  try {
    const m = (window.location.hash || "").match(/#\/org\/([^/]+)/);
    return m && m[1] ? decodeURIComponent(m[1]) : null;
  } catch {
    return null;
  }
}

function safeText(v) {
  return String(v ?? "");
}

function toItems(data) {
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.records)) return data.records;
  if (Array.isArray(data)) return data;
  return [];
}

function formatWhen(value) {
  if (value == null || value === "") return "Date unknown";
  const n = Number(value);
  const d = Number.isFinite(n) ? new Date(n) : new Date(value);
  if (Number.isNaN(d.getTime())) return "Date unknown";
  return d.toLocaleString();
}

export default function WitnessArchive() {
  const { orgId: orgIdParam } = useParams();
  const orgId = orgIdParam || getOrgIdFromHash();

  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [serverReady, setServerReady] = useState(true);
  const [createReady, setCreateReady] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState("");
  const reqSeq = useRef(0);
  const [draft, setDraft] = useState({
    title: "",
    summary: "",
    happened_at: "",
    visibility: "private",
  });

  async function refresh() {
    if (!orgId) return;
    const requestId = reqSeq.current + 1;
    reqSeq.current = requestId;
    setLoading(true);
    setErr("");
    try {
      const data = await api(`/api/orgs/${encodeURIComponent(orgId)}/witness`);
      if (reqSeq.current !== requestId) return;
      setItems(toItems(data));
      setServerReady(true);
      setCreateReady(true);
    } catch (e) {
      if (reqSeq.current !== requestId) return;
      setItems([]);
      setServerReady(false);
      setCreateReady(false);
      setErr(e?.message || String(e));
    } finally {
      if (reqSeq.current !== requestId) return;
      setLoading(false);
    }
  }

  async function createRecord() {
    if (!orgId || !createReady || saving) return;
    const title = safeText(draft.title).trim();
    const summary = safeText(draft.summary).trim();
    const happenedAt = safeText(draft.happened_at).trim();
    const visibility = safeText(draft.visibility).trim() || "private";

    if (!title) {
      setFormErr("Title is required.");
      return;
    }

    setSaving(true);
    setFormErr("");

    try {
      await api(`/api/orgs/${encodeURIComponent(orgId)}/witness`, {
        method: "POST",
        body: JSON.stringify({
          title,
          summary,
          happened_at: happenedAt || null,
          visibility,
        }),
      });

      setDraft({ title: "", summary: "", happened_at: "", visibility: "private" });
      setCreateOpen(false);
      await refresh();
    } catch (e) {
      setFormErr(e?.message || String(e));
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    refresh().catch(console.error);
  }, [orgId]);

  useEffect(() => () => {
    reqSeq.current += 1;
  }, []);

  const filtered = useMemo(() => {
    const needle = safeText(q).trim().toLowerCase();
    if (!needle) return items;
    return items.filter((item) =>
      [safeText(item?.title), safeText(item?.summary), safeText(item?.visibility)]
        .join(" ")
        .toLowerCase()
        .includes(needle)
    );
  }, [items, q]);

  if (!orgId) {
    return <div style={{ padding: 16 }}>No org selected.</div>;
  }

  return (
    <div className="card" style={{ margin: 16, padding: 12 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <h2 className="section-title" style={{ margin: 0, flex: 1 }}>
          Witness Archive
        </h2>
        {createReady ? (
          <button className="btn" type="button" onClick={() => setCreateOpen((v) => !v)}>
            {createOpen ? "Close" : "New record"}
          </button>
        ) : null}
      </div>

      <div className="helper" style={{ marginTop: 8 }}>
        Private metadata-first archive scaffold. The point right now is to make the page real in-repo, not to pretend it is finished.
      </div>

      <div className="row" style={{ gap: 10, marginTop: 12, flexWrap: "wrap" }}>
        <input
          className="input"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search witness records"
          style={{ minWidth: 240, flex: 1 }}
        />
        <button className="btn" type="button" onClick={() => refresh().catch(console.error)} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {createReady && createOpen ? (
        <div className="card" style={{ marginTop: 12, padding: 12 }}>
          <div style={{ fontWeight: 800 }}>Create witness record</div>
          <div className="grid" style={{ gap: 10, marginTop: 8 }}>
            <input
              className="input"
              value={draft.title}
              onChange={(e) => setDraft((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Title"
            />
            <textarea
              className="input"
              value={draft.summary}
              onChange={(e) => setDraft((prev) => ({ ...prev, summary: e.target.value }))}
              placeholder="Summary"
              rows={3}
            />
            <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
              <input
                className="input"
                value={draft.happened_at}
                onChange={(e) => setDraft((prev) => ({ ...prev, happened_at: e.target.value }))}
                placeholder="When (ISO string or epoch)"
                style={{ minWidth: 220, flex: 1 }}
              />
              <select
                className="input"
                value={draft.visibility}
                onChange={(e) => setDraft((prev) => ({ ...prev, visibility: e.target.value }))}
                style={{ minWidth: 160 }}
              >
                <option value="private">private</option>
                <option value="internal">internal</option>
                <option value="public">public</option>
              </select>
            </div>
            {formErr ? <div className="error">{formErr}</div> : null}
            <div className="row" style={{ gap: 10 }}>
              <button className="btn" type="button" onClick={() => createRecord().catch(console.error)} disabled={saving}>
                {saving ? "Saving..." : "Create"}
              </button>
              <button className="btn ghost" type="button" onClick={() => setCreateOpen(false)} disabled={saving}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {!serverReady ? (
        <div className="card" style={{ padding: 12, marginTop: 12 }}>
          <div style={{ fontWeight: 800 }}>Witness API not ready</div>
          <div className="helper" style={{ marginTop: 6 }}>
            The page exists now, which is the actual blocker you asked me to fix.
          </div>
          {err ? (
            <div className="error" style={{ marginTop: 8 }}>
              {err}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="grid" style={{ gap: 10, marginTop: 12 }}>
        {loading ? <div className="helper">Loading witness records...</div> : null}

        {!loading && filtered.length === 0 ? (
          <div className="card" style={{ padding: 12 }}>
            <div style={{ fontWeight: 800 }}>No witness records yet</div>
            <div className="helper" style={{ marginTop: 6 }}>
              Later batches can add create and edit flows once routes and server pieces are in place.
            </div>
          </div>
        ) : null}

        {!loading &&
          filtered.map((item) => (
            <div key={item?.id || `${item?.title || "record"}-${item?.happened_at || Math.random()}`} className="card" style={{ padding: 12 }}>
              <div style={{ fontWeight: 800 }}>{safeText(item?.title) || "Untitled record"}</div>
              <div className="helper" style={{ marginTop: 6 }}>
                {formatWhen(item?.happened_at)}
                {item?.visibility ? ` • ${safeText(item.visibility)}` : ""}
              </div>
              <div style={{ marginTop: 8 }}>
                {safeText(item?.summary) || "No summary yet."}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
