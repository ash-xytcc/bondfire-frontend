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
    <main className="rh-shell">
      <RedHarborHero />

      <Section
        id="what-we-do"
        label="what we do"
        title="A local branch built for durable organizing"
      >
        <div className="rh-grid-2">
          <div className="rh-panel">
            <h3>Workplace Support</h3>
            <p>
              Workers can connect with organizers about problems on the job, workplace dynamics, and
              practical next steps toward acting together.
            </p>
          </div>

          <div className="rh-panel">
            <h3>Meetings and Follow Up</h3>
            <p>
              The branch keeps a real meeting rhythm, internal notes, and ongoing coordination so
              people are not left floating after first contact.
            </p>
          </div>

          <div className="rh-panel">
            <h3>Mutual Support</h3>
            <p>
              A branch should be able to hold people through campaigns, emergencies, and the slower
              work of trust, logistics, and shared responsibility.
            </p>
          </div>

          <div className="rh-panel">
            <h3>Internal Operations</h3>
            <p>
              Documents, records, and sensitive coordination stay in the private backend instead of
              living out in public where they do not belong.
            </p>
          </div>
        </div>
      </Section>

      <Section
        id="get-involved"
        label="get involved"
        title="A few clear ways in"
      >
        <div className="rh-grid-3">
          <div className="rh-panel">
            <h3>Talk to an Organizer</h3>
            <p>
              Start here if something is happening at work and you need support, strategy, or a sane
              conversation about next steps.
            </p>
          </div>

          <div className="rh-panel">
            <h3>Join the Branch</h3>
            <p>
              For workers who want to plug into local meetings, branch structure, and ongoing
              organizing work.
            </p>
          </div>

          <div className="rh-panel">
            <h3>Offer Time or Skills</h3>
            <p>
              Design, outreach, logistics, rides, research, printing, food, tech. Durable branch
              work takes all kinds.
            </p>
          </div>
        </div>

        <div className="rh-button-row" style={{ marginTop: 18 }}>
          <a className="rh-btn rh-btn-primary" href="/?app=red-harbor#/signin">
            Member Sign In
          </a>
          <a className="rh-btn" href="mailto:redharbor@iww.org">
            Contact the Branch
          </a>
        </div>
      </Section>

      <Section id="meetings" label="meetings" title="Meeting rhythm and branch cadence">
        <div className="rh-grid-2">
          <div className="rh-panel rh-meeting">
            <div className="rh-aside-label">next branch meeting</div>
            <div className="rh-meeting-time">Thursday 6:00 PM</div>
            <div className="rh-meeting-meta">General branch meeting</div>
            <p>
              Placeholder for now, but enough to make the site feel alive and locally grounded
              instead of like a brochure abandoned in a lobby.
            </p>
          </div>

          <div className="rh-panel">
            <h3>Membership and Dues</h3>
            <p>
              This area is reserved for dues structure, joining information, and practical member
              expectations once you are ready to publish them.
            </p>
          </div>
        </div>
      </Section>

      <Section id="resources" label="resources" title="Useful starting points">
        <div className="rh-grid-3">
          <a className="rh-resource-link" href="https://www.iww.org" target="_blank" rel="noreferrer">
            <strong>Industrial Workers of the World</strong>
            <span>National union information, structure, and context.</span>
          </a>

          <a className="rh-resource-link" href="https://archive.iww.org" target="_blank" rel="noreferrer">
            <strong>Organizing Resources</strong>
            <span>Training materials, campaign history, and practical labor organizing information.</span>
          </a>

          <a className="rh-resource-link" href="mailto:redharbor@iww.org">
            <strong>Contact Red Harbor</strong>
            <span>Use a placeholder branch address for now and swap in the real one later.</span>
          </a>
        </div>
      </Section>

      <Section id="contact" label="contact" title="Public front door, private workroom">
        <p className="rh-footer-note">
          This public side introduces the branch. The private backend is where meetings, records,
          documents, and internal operations live. One face outward, one workspace inward.
        </p>

        <div className="rh-button-row" style={{ marginTop: 18 }}>
          <a className="rh-btn rh-btn-primary" href="/?app=red-harbor#/signin">
            Sign In
          </a>
          <a className="rh-btn" href="mailto:redharbor@iww.org">
            Email the Branch
          </a>
        </div>
      </Section>
    </main>
  );
}
