import React from "react";

export default function CommsPage() {
  return (
    <main className="page-shell" style={{ maxWidth: 1000, margin: "0 auto", padding: 16 }}>
      <div className="card" style={{ padding: 20 }}>
        <div className="helper" style={{ marginBottom: 8 }}>COMMUNICATIONS</div>
        <h1 style={{ marginTop: 0 }}>signal + branch communications</h1>
        <p style={{ color: "var(--muted,#c9c9c9)", lineHeight: 1.6 }}>
          Red Harbor uses Signal for live conversation and rapid coordination. Bondfire is for structured information,
          records, meetings, announcements, and public/private publishing.
        </p>

        <div style={{ display: "grid", gap: 12, marginTop: 20 }}>
          <div className="card" style={{ padding: 16 }}>
            <strong>Main Signal chat</strong>
            <p style={{ marginTop: 8, color: "var(--muted,#c9c9c9)" }}>
              Add your main Signal invite link here once you’re ready.
            </p>
            <code>SIGNAL_LINK_HERE</code>
          </div>

          <div className="card" style={{ padding: 16 }}>
            <strong>use Signal for</strong>
            <ul style={{ marginBottom: 0 }}>
              <li>real time conversation</li>
              <li>urgent coordination</li>
              <li>quick check-ins</li>
            </ul>
          </div>

          <div className="card" style={{ padding: 16 }}>
            <strong>use Bondfire for</strong>
            <ul style={{ marginBottom: 0 }}>
              <li>member/admin records</li>
              <li>announcements</li>
              <li>meetings and events</li>
              <li>documents and resources</li>
              <li>public page publishing</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
