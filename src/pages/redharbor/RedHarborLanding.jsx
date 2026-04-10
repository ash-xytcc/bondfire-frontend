import React from "react";
import RedHarborHero from "../../components/redharbor/RedHarborHero";
import "../../styles/redharbor.css";

function Section({ id, label, title, children }) {
  return (
    <section id={id} className="rh-section">
      <div className="rh-section-label">{label}</div>
      <div>
        <h2 className="rh-section-title">{title}</h2>
        {children}
      </div>
    </section>
  );
}

export default function RedHarborLanding() {
  React.useEffect(() => {
    document.body.classList.add("rh-body");
    return () => document.body.classList.remove("rh-body");
  }, []);

  return (
    <main className="rh-page">
      <RedHarborHero />

      <Section id="what-we-do" label="what we do" title="A branch built for durable organizing">
        <div className="rh-grid-2">
          <div className="rh-card">
            <h3>Workplace Support</h3>
            <p>
              Workers can connect with organizers about conditions on the job, strategy, and practical
              next steps toward acting together.
            </p>
          </div>
          <div className="rh-card">
            <h3>Meetings and Follow Up</h3>
            <p>
              The branch keeps a real meeting rhythm, internal notes, and continuity instead of leaving
              people stranded after first contact.
            </p>
          </div>
          <div className="rh-card">
            <h3>Mutual Support</h3>
            <p>
              A branch should be able to hold people through campaigns, emergencies, and ordinary local work.
            </p>
          </div>
          <div className="rh-card">
            <h3>Internal Operations</h3>
            <p>
              Documents, records, and private coordination stay inside the backend where they belong.
            </p>
          </div>
        </div>
      </Section>

      <Section id="get-involved" label="get involved" title="Clear ways in">
        <div className="rh-grid-3">
          <div className="rh-card">
            <h3>Talk to an Organizer</h3>
            <p>Start here if something is happening at work and you need support or strategy.</p>
          </div>
          <div className="rh-card">
            <h3>Join the Branch</h3>
            <p>For workers ready to plug into local meetings, branch structure, and organizing work.</p>
          </div>
          <div className="rh-card">
            <h3>Offer Time or Skills</h3>
            <p>Research, rides, printing, outreach, design, food, logistics, tech. The glamorous stuff.</p>
          </div>
        </div>
      </Section>

      <Section id="resources" label="resources" title="Starting points">
        <div className="rh-grid-3">
          <div className="rh-card">
            <h3>IWW</h3>
            <p>National union information, structure, and broader context.</p>
          </div>
          <div className="rh-card">
            <h3>Organizing Resources</h3>
            <p>Training material, campaign history, and practical labor organizing information.</p>
          </div>
          <div className="rh-card">
            <h3>Contact</h3>
            <p>Public branch contact information and front-door communication.</p>
          </div>
        </div>
      </Section>
    </main>
  );
}
