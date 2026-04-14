import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

function getOrgDisplayName(orgId) {
  if (!orgId) return "current workspace";
  try {
    const settings = JSON.parse(localStorage.getItem(`bf_org_settings_${orgId}`) || "{}");
    const orgs = JSON.parse(localStorage.getItem("bf_orgs") || "[]");
    const match = Array.isArray(orgs) ? orgs.find((o) => o?.id === orgId) : null;
    return String(settings?.name || match?.name || orgId);
  } catch {
    return String(orgId);
  }
}

const MOCK_ATTENDEES = [
  {
    id: 'A-101',
    name: 'Riley Ortega',
    email: 'riley@example.org',
    status: 'captured',
    volunteer: true,
    sessionLead: false,
    access: 'Mobility notes',
    notes: 'Interested in helping with setup and quiet space support.',
    updatedAt: '2h ago',
  },
  {
    id: 'A-102',
    name: 'Juniper Fields',
    email: 'juniper@example.org',
    status: 'confirmed',
    volunteer: false,
    sessionLead: true,
    access: 'ASL requested',
    notes: 'Wants to lead a session on jail support and movement security culture.',
    updatedAt: '5h ago',
  },
  {
    id: 'A-103',
    name: 'Mica Salazar',
    email: 'mica@example.org',
    status: 'form_complete',
    volunteer: true,
    sessionLead: true,
    access: 'No notes',
    notes: 'Detailed form complete. Strong interest in mutual aid logistics and cooking crew.',
    updatedAt: '1d ago',
  },
  {
    id: 'A-104',
    name: 'Devon Lake',
    email: 'devon@example.org',
    status: 'needs_followup',
    volunteer: false,
    sessionLead: false,
    access: 'Sensory/quiet camping request',
    notes: 'Email captured but detailed form still incomplete.',
    updatedAt: '2d ago',
  },
];

const STATUS_META = {
  captured: { label: 'Email captured', tone: '#dbe6f5', text: '#21405f' },
  confirmed: { label: 'Confirmation sent', tone: '#d9efd1', text: '#2f4b2a' },
  form_started: { label: 'Form started', tone: '#fff0b7', text: '#5e4d14' },
  form_complete: { label: 'Form complete', tone: '#d7f4e1', text: '#23553a' },
  needs_followup: { label: 'Needs follow-up', tone: '#f7d7df', text: '#6a2540' },
};

function StatCard({ label, value, helper }) {
  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--muted)' }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 800, margin: '8px 0 6px' }}>{value}</div>
      <div style={{ color: 'var(--muted)', lineHeight: 1.5 }}>{helper}</div>
    </div>
  );
}

function Pill({ status }) {
  const meta = STATUS_META[status] || STATUS_META.captured;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: 999,
        padding: '6px 10px',
        background: meta.tone,
        color: meta.text,
        fontSize: 12,
        fontWeight: 800,
        whiteSpace: 'nowrap',
      }}
    >
      {meta.label}
    </span>
  );
}

export default function Attendees() {
  const { orgId } = useParams();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedId, setSelectedId] = useState(MOCK_ATTENDEES[0]?.id || null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MOCK_ATTENDEES.filter((person) => {
      const matchesStatus = statusFilter === 'all' ? true : person.status === statusFilter;
      const matchesQuery = !q
        ? true
        : `${person.name} ${person.email} ${person.notes} ${person.access}`.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [query, statusFilter]);

  const selected = filtered.find((person) => person.id === selectedId) || filtered[0] || null;

  const counts = useMemo(() => {
    const base = {
      total: MOCK_ATTENDEES.length,
      volunteer: MOCK_ATTENDEES.filter((p) => p.volunteer).length,
      sessionLead: MOCK_ATTENDEES.filter((p) => p.sessionLead).length,
      needsFollowup: MOCK_ATTENDEES.filter((p) => p.status === 'needs_followup').length,
    };
    return base;
  }, []);

  return (
    <div style={{ padding: 16, display: 'grid', gap: 16 }}>
      <div className="card" style={{ padding: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ marginTop: 0, marginBottom: 8 }}>Attendees</h1>
            <p style={{ margin: 0, lineHeight: 1.6, color: 'var(--muted)' }}>
              First-pass DPG attendee pipeline. This is where email capture, confirmation state, follow-up form progress,
              volunteer interest, access notes, and organizer-facing coordination will live.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'start', flexWrap: 'wrap' }}>
            <button className="btn-red" type="button">Capture RSVP</button>
            <button className="btn" type="button">Export CSV</button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <StatCard label="Total tracked" value={counts.total} helper="Everyone currently in the RSVP pipeline." />
        <StatCard label="Volunteers" value={counts.volunteer} helper="People who already raised a hand to help." />
        <StatCard label="Potential session leads" value={counts.sessionLead} helper="People offering to lead or hold space." />
        <StatCard label="Needs follow-up" value={counts.needsFollowup} helper="People who still need organizer attention." />
      </div>

      <div className="card" style={{ padding: 16 }}>
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'minmax(220px, 1.3fr) minmax(180px, .8fr)' }}>
          <input
            className="input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email, access notes, or organizer notes"
          />
          <select className="input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All statuses</option>
            <option value="captured">Email captured</option>
            <option value="confirmed">Confirmation sent</option>
            <option value="form_started">Form started</option>
            <option value="form_complete">Form complete</option>
            <option value="needs_followup">Needs follow-up</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'minmax(0, 1.25fr) minmax(320px, .9fr)' }}>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: 16, borderBottom: '1px solid var(--border)' }}>
            <strong>Tracked people</strong>
          </div>
          <div style={{ display: 'grid' }}>
            {filtered.length ? filtered.map((person) => {
              const active = person.id === selected?.id;
              return (
                <button
                  key={person.id}
                  type="button"
                  onClick={() => setSelectedId(person.id)}
                  style={{
                    textAlign: 'left',
                    background: active ? 'rgba(95,148,221,.18)' : 'rgba(255,255,255,0.04)',
                    color: 'var(--text)',
                    border: 'none',
                    borderBottom: '1px solid var(--border)',
                    borderRadius: 0,
                    padding: 16,
                    display: 'grid',
                    gap: 8,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ fontWeight: 800 }}>{person.name}</div>
                    <Pill status={person.status} />
                  </div>
                  <div style={{ color: 'var(--muted)' }}>{person.email}</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', color: 'var(--muted)', fontSize: 13 }}>
                    {person.volunteer ? <span>Volunteer interested</span> : null}
                    {person.sessionLead ? <span>Can lead a session</span> : null}
                    <span>Updated {person.updatedAt}</span>
                  </div>
                </button>
              );
            }) : (
              <div style={{ padding: 16, color: 'var(--muted)' }}>No attendees match this filter yet.</div>
            )}
          </div>
        </div>

        <div className="card" style={{ padding: 18, alignSelf: 'start' }}>
          {selected ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'start', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--muted)', marginBottom: 8 }}>Attendee detail</div>
                  <h2 style={{ marginTop: 0, marginBottom: 6 }}>{selected.name}</h2>
                  <div style={{ color: 'var(--muted)' }}>{selected.email}</div>
                </div>
                <Pill status={selected.status} />
              </div>

              <div style={{ marginTop: 16, display: 'grid', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--muted)', marginBottom: 6 }}>Access notes</div>
                  <div>{selected.access}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--muted)', marginBottom: 6 }}>Organizer notes</div>
                  <div style={{ lineHeight: 1.6 }}>{selected.notes}</div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span className="tag">{selected.volunteer ? 'Volunteer interested' : 'No volunteer flag yet'}</span>
                  <span className="tag">{selected.sessionLead ? 'Can lead a session' : 'No session lead flag yet'}</span>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button className="btn" type="button">Send reminder</button>
                  <button className="btn" type="button">Mark reviewed</button>
                  <button className="btn-red" type="button">Open full profile</button>
                </div>
              </div>
            </>
          ) : (
            <div style={{ color: 'var(--muted)' }}>Select an attendee to view details.</div>
          )}
        </div>
      </div>

      <div className="card" style={{ padding: 16 }}>
        <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--muted)', marginBottom: 8 }}>Next build steps</div>
        <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7 }}>
          <li>Wire this list to real RSVP capture records instead of mock entries.</li>
          <li>Add detailed form completion state and segmented email actions.</li>
          <li>Add volunteer, session interest, and access tags from the real intake flow.</li>
          <li>Support organizer notes, status updates, and export tools.</li>
        </ul>
        <div style={{ marginTop: 12, color: 'var(--muted)' }}><strong>Current org:</strong> {getOrgDisplayName(orgId)}</div>
      </div>
    </div>
  );
}
