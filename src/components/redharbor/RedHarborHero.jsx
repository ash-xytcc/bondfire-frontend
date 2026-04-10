import React from "react";
import "../../styles/redharbor.css";

function scrollToId(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function RedHarborHero() {
  return (
    <section className="rh-hero">
      <div className="rh-kicker">industrial workers of the world</div>

      <div className="rh-hero-grid">
        <div>
          <h1 className="rh-title">
            red
            <br />
            harbor
          </h1>
          <p className="rh-lead">
            A local branch front door built for workers, organizers, and people looking for a real
            structure to plug into. Public information lives here. Internal operations stay behind
            sign in.
          </p>
        </div>

        <aside className="rh-hero-aside">
          <div className="rh-aside-label">grays harbor branch</div>
          <p className="rh-aside-copy">
            Practical organizing. Branch coordination. Training. Mutual support. No generic SaaS
            nonsense. Just a union site that looks like it belongs to people who mean it.
          </p>

          <div className="rh-button-row">
            <a className="rh-btn rh-btn-primary" href="/?app=red-harbor#/signin">
              Member Sign In
            </a>
            <button className="rh-btn" type="button" onClick={() => scrollToId("get-involved")}>
              Get Involved
            </button>
            <button className="rh-btn" type="button" onClick={() => scrollToId("resources")}>
              Resources
            </button>
          </div>
        </aside>
      </div>

      <div className="rh-rule" />

      <div className="rh-bands">
        <div className="rh-band">workplace organizing</div>
        <div className="rh-band">branch meetings</div>
        <div className="rh-band">direct action</div>
        <div className="rh-band">solidarity and support</div>
      </div>
    </section>
  );
}
