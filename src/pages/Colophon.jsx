import React from "react";

const COLOPHON_URL = "https://colophon-hub.github.io/colophon/";
const COLOPHON_RELEASES_URL = "https://github.com/colophon-hub/colophon/releases/latest";

export default function Colophon() {
  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: 20 }}>
      <div className="card" style={{ padding: 22 }}>
        <p className="helper" style={{ letterSpacing: ".12em", textTransform: "uppercase" }}>
          Optional module // publishing
        </p>
        <h1 style={{ marginTop: 8 }}>Colophon</h1>
        <p style={{ maxWidth: 680, lineHeight: 1.65 }}>
          Colophon is the publishing room for articles, archives, campaigns, podcasts,
          translations, print work, and public editorial projects. Bondfire remains the
          coordination room; Colophon remains the publication system.
        </p>

        <div className="row" style={{ gap: 10, flexWrap: "wrap", marginTop: 18 }}>
          <a className="btn-red" href={COLOPHON_URL} target="_blank" rel="noreferrer">
            Open Colophon
          </a>
          <a className="btn" href={COLOPHON_RELEASES_URL} target="_blank" rel="noreferrer">
            Releases + self-hosting
          </a>
        </div>

        <div
          className="card"
          style={{
            marginTop: 22,
            padding: 16,
            background: "rgba(255,255,255,0.03)",
          }}
        >
          <strong>How this module works</strong>
          <p className="helper" style={{ marginBottom: 0, lineHeight: 1.6 }}>
            This opens the existing Colophon application rather than pretending Bondfire
            is another CMS. Shared identity, permission translation, and explicit
            publishing handoffs are the next integration boundary; private Bondfire
            material never becomes public automatically.
          </p>
        </div>
      </div>
    </div>
  );
}
