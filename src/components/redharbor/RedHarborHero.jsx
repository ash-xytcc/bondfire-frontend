import React from "react";

export default function RedHarborHero() {
  return (
    <section className="card" style={{ padding: 24, border: "1px solid rgba(255,255,255,0.12)" }}>
      <div className="helper" style={{ marginBottom: 8, letterSpacing: 1 }}>
        IWW RED HARBOR
      </div>
      <h1 style={{ margin: 0, fontSize: "clamp(2rem, 5vw, 3.5rem)", lineHeight: 1.05 }}>
        a practical union presence on the harbor
      </h1>
      <p style={{ marginTop: 16, maxWidth: 760, fontSize: "1.05rem", color: "var(--muted,#c9c9c9)" }}>
        Red Harbor is building a local industrial union branch rooted in worker solidarity, real organizing,
        and durable local structure. This is the public face of that work.
      </p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 20 }}>
        <a className="btn-red" href="/?app=red-harbor#/p/red-harbor">Public Page</a>
        <a className="btn" href="/?app=red-harbor#/orgs">Open Ops</a>
      </div>
    </section>
  );
}
