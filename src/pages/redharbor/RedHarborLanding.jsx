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
        title="A local branch built for real organizing"
      >
        <div className="rh-grid-2">
          <div className="rh-panel">
            <h3>Workplace Support</h3>
            <p>
              Talk with workers about organizing on the job, mapping relationships, identifying
              pressure points, and building collective power with some actual structure behind it.
            </p>
          </div>

          <div className="rh-panel">
            <h3>Meetings and Training</h3>
            <p>
              Hold branch meetings, follow up, and practical organizer development that moves people
              from interest to participation instead of leaving them stranded at slogans.
            </p>
          </div>

          <div className="rh-panel">
            <h3>Mutual Support</h3>
            <p>
              Maintain a branch that can hold people through campaigns, emergencies, and the slow
              ordinary work of trust, logistics, and showing up for one another.
            </p>
          </div>

          <div className="rh-panel">
            <h3>Internal Coordination</h3>
            <p>
              Keep internal records, documents, meeting notes, and operations in the private backend
              where they belong, instead of hanging them out for bosses and cops to browse.
            </p>
          </div>
        </div>
      </Section>

      <Section
        id="get-involved"
        label="get involved"
        title="Several ways in, none of them require pretending to be polished"
      >
        <div className="rh-grid-3">
          <div className="rh-panel">
            <h3>Talk to an Organizer</h3>
            <p>
              If something is happening at work and you need to talk strategy, support, or next
              steps, start there.
            </p>
          </div>

          <div className="rh-panel">
            <h3>Join the Branch</h3>
            <p>
              If you want to plug into local meetings, committees, or organizing work, this is where
              that path begins.
            </p>
          </div>

          <div className="rh-panel">
            <h3>Volunteer Skills or Time</h3>
            <p>
              Printing, rides, research, outreach, food, logistics, design, tech. Branch work takes
              many forms and most of them are not glamorous.
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

      <Section id="meetings" label="meetings" title="Public meeting rhythm">
        <div className="rh-grid-2">
          <div className="rh-panel rh-meeting">
            <div className="rh-aside-label">next branch meeting</div>
            <div className="rh-meeting-time">Thursday 6:00 PM</div>
            <div className="rh-meeting-meta">General Branch Meeting</div>
            <p>
              Use this as a live-looking placeholder for now. Once you have a real cadence to show,
              we can swap in actual branch meeting info and location details.
            </p>
          </div>

          <div className="rh-panel">
            <h3>Membership and Dues</h3>
            <p>
              This is where dues structure, joining information, and branch expectations will live.
              For now it signals that the site has room for actual union logistics, not just a mood.
            </p>
          </div>
        </div>
      </Section>

      <Section id="resources" label="resources" title="Starting points for workers">
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
            <span>Use a placeholder branch email for now and swap it once the real address is set.</span>
          </a>
        </div>
      </Section>

      <Section id="contact" label="contact" title="The front door and the internal door">
        <p className="rh-footer-note">
          This public side is the front door. The private Bondfire backend is where the branch handles
          internal coordination, meetings, notes, documents, and sensitive operations. One public face,
          one internal workspace, no fake public org-page detour.
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
