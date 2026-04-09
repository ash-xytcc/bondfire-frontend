import React from 'react';
import { useParams } from 'react-router-dom';

function Card({ title, children }) {
  return (
    <div className="card" style={{ padding: 16 }}>
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      {children}
    </div>
  );
}

export default function Attendees() {
  const { orgId } = useParams();

  return (
    <div style={{ padding: 16, display: 'grid', gap: 16 }}>
      <div className="card" style={{ padding: 18 }}>
        <h1 style={{ marginTop: 0, marginBottom: 8 }}>Attendees</h1>
        <p style={{ margin: 0, lineHeight: 1.6, color: 'var(--muted, #bdbdbd)' }}>
          This is the new DPG-specific attendee pipeline area. It will handle simple RSVP capture,
          follow-up form completion, attendance status, volunteer flags, and organizer-facing notes.
        </p>
      </div>

      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
        <Card title="Pipeline stages">
          <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7 }}>
            <li>Email captured</li>
            <li>Confirmation sent</li>
            <li>Detailed form started</li>
            <li>Detailed form complete</li>
            <li>Needs follow-up</li>
          </ul>
        </Card>

        <Card title="Planned fields">
          <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7 }}>
            <li>email</li>
            <li>display name</li>
            <li>volunteer interest</li>
            <li>session interest / leadership</li>
            <li>access needs</li>
          </ul>
        </Card>
      </div>

      <div className="card" style={{ padding: 16 }}>
        <strong>Current org:</strong> {orgId || 'unknown'}
      </div>
    </div>
  );
}
