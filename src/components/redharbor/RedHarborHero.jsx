import React from "react";

function scrollToId(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function RedHarborHero() {
  return (
    <section
      className="card"
      style={{
        padding: 28,
        border: "1px solid rgba(255,255,255,0.12)",
        background:
          "linear-gradient(180deg, rgba(209,0,0,0.16) 0%, rgba(255,255,255,0.02) 100%)",
        overflow: "hidden",
      }}
    >
      <div
        className="helper"
        style={{
          marginBottom: 10,
          letterSpacing: 1.5,
          color: "rgba(255,255,255,0.72)",
          fontWeight: 800,
        }}
      >
        IWW RED HARBOR
      </div>

      <div style={{ display: "grid", gap: 18 }}>
        <div style={{ display: "grid", gap: 14, maxWidth: 860 }}>
          <h1
            style={{
              margin: 0,
              fontSize: "clamp(2.4rem, 6vw, 4.6rem)",
              lineHeight: 0.95,
              letterSpacing: "-0.03em",
            }}
          >
            organizing workers
            <br />
            across grays harbor
          </h1>

          <p
            style={{
              margin: 0,
              maxWidth: 760,
              fontSize: "1.08rem",
              lineHeight: 1.65,
              color: "var(--muted,#c9c9c9)",
            }}
          >
            Red Harbor is building a practical local union presence rooted in solidarity,
            workplace organizing, branch structure, training, and mutual support. This is the
            public front door. Internal operations stay behind sign in.
          </p>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a className="btn-red" href="/?app=red-harbor#/signin">Member Sign In</a>
          <button className="btn" type="button" onClick={() => scrollToId("get-involved")}>
            Get Involved
          </button>
          <button className="btn" type="button" onClick={() => scrollToId("resources")}>
            Resources
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 12,
            marginTop: 6,
          }}
        >
          {[
            "direct action",
            "workplace organizing",
            "branch meetings",
            "solidarity and support",
          ].map((item) => (
            <div
              key={item}
              style={{
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 14,
                padding: "12px 14px",
                background: "rgba(255,255,255,0.03)",
                fontWeight: 700,
                textTransform: "lowercase",
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
