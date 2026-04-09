import React from 'react';
import { useParams } from 'react-router-dom';

const stickyBase = {
  borderRadius: 12,
  padding: 14,
  boxShadow: '0 12px 24px rgba(0,0,0,0.12)',
  minHeight: 140,
  color: '#171717',
};

function Sticky({ title, text, bg, rotate }) {
  return (
    <div style={{ ...stickyBase, background: bg, transform: `rotate(${rotate})` }}>
      <div style={{ fontWeight: 800, marginBottom: 8 }}>{title}</div>
      <div style={{ lineHeight: 1.5, fontSize: 14 }}>{text}</div>
    </div>
  );
}

export default function Sessions() {
  const { orgId } = useParams();

  return (
    <div style={{ padding: 16, display: 'grid', gap: 16 }}>
      <div className="card" style={{ padding: 18 }}>
        <h1 style={{ marginTop: 0, marginBottom: 8 }}>Sessions</h1>
        <p style={{ margin: 0, lineHeight: 1.6, color: 'var(--muted, #bdbdbd)' }}>
          This is the future home of the DPG session commons: ideas, upvotes, pre-scheduled anchors,
          and "I can lead this" flows, all shaped around the actual whiteboard process used at the event.
        </p>
      </div>

      <div style={{ display: 'grid', gap: 18, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <Sticky title="Anchors" text="A few things pre-scheduled ahead of time." bg="#fff0a8" rotate="-2deg" />
        <Sticky title="Interest pool" text="Ideas people want, with upvotes and demand signals." bg="#d6f8ff" rotate="1.5deg" />
        <Sticky title="Lead this" text="Someone can step forward to facilitate or hold the slot." bg="#ffdceb" rotate="-1deg" />
        <Sticky title="Build on site" text="Most of the real programming still comes together in person." bg="#dcffc8" rotate="2deg" />
      </div>

      <div className="card" style={{ padding: 16 }}>
        <strong>Current org:</strong> {orgId || 'unknown'}
      </div>
    </div>
  );
}
