import React from 'react';
import { getBranding } from '../lib/appVariant.js';

const sectionCard = {
  border: '1px solid rgba(17,17,17,0.12)',
  borderRadius: 18,
  padding: 18,
  background: 'rgba(255,255,255,0.88)',
  boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
};

function Sticky({ title, text, rotate = '-1deg', tone = '#fff7a8' }) {
  return (
    <div style={{
      background: tone,
      borderRadius: 10,
      padding: 16,
      minHeight: 150,
      boxShadow: '0 12px 24px rgba(0,0,0,0.10)',
      transform: `rotate(${rotate})`,
      border: '1px solid rgba(0,0,0,0.08)',
    }}>
      <div className="dpg-heading" style={{ fontSize: 15, fontWeight: 800, marginBottom: 10 }}>{title}</div>
      <div style={{ fontSize: 14, lineHeight: 1.5 }}>{text}</div>
    </div>
  );
}

export default function DpgPublicHome() {
  const brand = getBranding();
  const colors = brand.colors || {};

  return (
    <div style={{ minHeight: '100vh', background: colors.paper || '#f7f3ea', color: '#171717' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '28px 20px 64px' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center', flexWrap: 'wrap', marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18 }}>
            <img src={brand.logoSrc} alt={brand.logoAlt} style={{ width: 86, height: 86, objectFit: 'contain', flex: '0 0 auto' }} />
            <div>
              <div style={{ fontSize: 13, letterSpacing: '.08em', textTransform: 'uppercase', opacity: 0.7, marginBottom: 8 }}>Dual Power West</div>
              <h1 className="dpg-heading" style={{ fontSize: 'clamp(2.3rem, 6vw, 5rem)', lineHeight: 0.95, margin: 0 }}>Build it together before we even arrive.</h1>
            </div>
          </div>
          <a href={brand.adminSignInHref} style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            minHeight: 48, padding: '0 18px', borderRadius: 999, textDecoration: 'none',
            background: colors.green || '#171717', color: '#fff', fontWeight: 800,
          }}>Organizer login</a>
        </header>

        <section style={{ ...sectionCard, marginBottom: 22 }}>
          <p style={{ fontSize: 18, lineHeight: 1.6, margin: 0, maxWidth: 860 }}>
            This is the new public front door for {brand.publicSiteTitle}. Public event info lives here.
            The private organizer workspace lives at <strong>/admin</strong>. That is where the Bondfire-style tools,
            encrypted docs, shared ops, attendees, sessions, and admin work will live.
          </p>
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18, marginBottom: 26 }}>
          <Sticky title="RSVP first" text="Start with simple email capture, then follow up with the fuller form by email." rotate="-2deg" tone="#f3e28b" />
          <Sticky title="Sessions" text="Suggest ideas, upvote them, and volunteer to lead without flattening the real at-event whiteboard process." rotate="1.5deg" tone={colors.mist || '#c7f2ff'} />
          <Sticky title="Ops center" text="Drive, meetings, needs, inventory, people, and admin coordination all in one place instead of tool sprawl hell." rotate="-1deg" tone="#dce8d6" />
          <Sticky title="Accessibility + privacy" text="Built to be usable and secure by default, not treated like an afterthought tacked on later." rotate="2deg" tone="#d9e8f8" />
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: '1.2fr .8fr', gap: 20, alignItems: 'start' }}>
          <div style={sectionCard}>
            <h2 className="dpg-heading" style={{ marginTop: 0 }}>What is in progress</h2>
            <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7 }}>
              <li>Dedicated public site at the main domain</li>
              <li>Private organizer workspace at <code>/admin</code></li>
              <li>Bondfire-style tools in Dual Power West garb</li>
              <li>New attendee and session modules for DPG-specific workflows</li>
              <li>Email flow for RSVP confirmation and detailed follow-up form</li>
            </ul>
          </div>
          <div style={sectionCard}>
            <h2 className="dpg-heading" style={{ marginTop: 0 }}>Organizer entry</h2>
            <p style={{ marginTop: 0, lineHeight: 1.6 }}>
              Admin is using hash routes for now so we can get moving fast without doing a full routing surgery first.
            </p>
            <a href={brand.adminSignInHref} style={{ color: '#171717', fontWeight: 800 }}>Go to admin sign-in</a>
          </div>
        </section>
      </div>
    </div>
  );
}
