import React from "react";
import "../../styles/redharbor.css";

function scrollToId(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function RedHarborHero() {
  return (
    <section className="rh-landing-hero">
      <div className="rh-landing-kicker">Grays Harbor Branch</div>
      <h1 className="rh-landing-title">
        Red
        <br />
        Harbor
      </h1>
      <p className="rh-landing-lead">
        A public front door for the branch and a private workspace behind it. Local, grounded,
        and built for real organizing instead of startup theater.
      </p>

      <div className="rh-auth-toolbar">
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

      <div className="rh-landing-grid">
        <div className="rh-land-panel">
          <h3>Local structure</h3>
          <p>
            Meetings, follow up, branch coordination, and the slow unglamorous work that lets people
            actually rely on a union.
          </p>
        </div>
        <div className="rh-land-panel">
          <h3>Private operations</h3>
          <p>
            Sensitive records and working materials stay inside the internal system where they belong.
          </p>
        </div>
      </div>
    </section>
  );
}
