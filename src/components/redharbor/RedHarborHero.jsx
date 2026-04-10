import React from "react";
import "../../styles/redharbor.css";

function scrollToId(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function RedHarborHero() {
  return (
    <section className="rh-hero">
      <div className="rh-kicker">grays harbor branch</div>

      <div className="rh-hero-grid">
        <div>
          <h1 className="rh-title">
            red
            <br />
            harbor
          </h1>
          <p className="rh-lead">
            A local front door for workers, organizers, and branch members on the harbor. Public
            information lives here. Internal records, meetings, and operations stay behind sign in.
          </p>
        </div>

        <aside className="rh-hero-aside">
          <div className="rh-aside-label">muted maritime institutional</div>
          <p className="rh-aside-copy">
            Built to feel local, steady, and real. Less app. Less slogan. More like a harbor office
            that has quietly been here long enough to matter.
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
        <div className="rh-band">workplace support</div>
        <div className="rh-band">branch meetings</div>
        <div className="rh-band">organizing tools</div>
        <div className="rh-band">local structure</div>
      </div>
    </section>
  );
}
