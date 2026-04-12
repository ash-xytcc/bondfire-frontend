import React from "react";
import { Link } from "react-router-dom";
import "../styles/redharbor-public-pass1.css";

const bulletinSidePosts = [
  {
    title: "What Red Harbor is trying to build",
    body:
      "The branch frames its goal as rebuilding wobbly labor organizing on the Harbor while expanding who benefits from that organizing beyond narrow workplace definitions.",
    sectionId: "join",
  },
  {
    title: "The Harbor has union memory",
    body:
      "The public site roots current organizing in Grays Harbor labor history, including the free speech fight in Aberdeen and major struggles led by Wobblies in timber country.",
    sectionId: "history",
  },
];

const events = [
  "Branch meetings, public events, and organizing opportunities will be posted here.",
  "One to one organizing support can be offered for workers trying to get started on the job.",
  "Statements, bulletins, and campaign updates will live here as public branch publishing expands.",
];

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function SectionLink({ id, children, className = "" }) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => scrollToSection(id)}
    >
      {children}
    </button>
  );
}

export default function RedHarborHome() {
  return (
    <div className="rh-public">
      <header className="rh-public-header">
        <div className="rh-public-brand">
          <img
            src="/red-harbor-logo.png"
            alt="Red Harbor logo"
            className="rh-public-logo"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <div className="rh-public-brandtext">
            <div className="rh-public-kicker">Industrial Workers of the World</div>
            <div className="rh-public-title">Red Harbor</div>
          </div>
        </div>

        <nav className="rh-public-nav" aria-label="Primary">
          <SectionLink id="about" className="rh-nav-link">About</SectionLink>
          <SectionLink id="join" className="rh-nav-link">Join</SectionLink>
          <SectionLink id="bulletin" className="rh-nav-link">Bulletin</SectionLink>
          <SectionLink id="events" className="rh-nav-link">Events</SectionLink>
          <SectionLink id="contact" className="rh-nav-link">Contact</SectionLink>
          <Link to="/signin" className="rh-signin-link">Member Sign In</Link>
        </nav>
      </header>

      <main>
        <section className="rh-hero">
          <div className="rh-hero-copy">
            <p className="rh-eyebrow">Red Harbor Branch</p>
            <h1>Building worker power on the harbor and beyond.</h1>
            <p className="rh-lead">
              Red Harbor is part of the return of IWW organizing to Grays Harbor.
              We organize across workplaces, support workers in struggle, publish
              branch updates, and build solidarity rooted in direct action, rank
              and file power, and the Harbor’s own long history of labor conflict.
            </p>
            <div className="rh-hero-actions">
              <SectionLink id="join" className="rh-btn rh-btn-primary">Join Us</SectionLink>
              <SectionLink id="bulletin" className="rh-btn rh-btn-secondary">Read the Bulletin</SectionLink>
              <Link to="/signin" className="rh-btn rh-btn-ghost">Member Area</Link>
            </div>
          </div>

          <aside className="rh-hero-card">
            <h2>What this site is for</h2>
            <ul>
              <li>Learn what the branch is and what it does</li>
              <li>Find organizing and membership information</li>
              <li>Read public updates and branch publications</li>
              <li>Access the private branch board through sign in</li>
            </ul>
          </aside>
        </section>

        <section id="about" className="rh-section">
          <div className="rh-section-head">
            <p className="rh-section-kicker">About</p>
            <h2>About Red Harbor</h2>
          </div>

          <div className="rh-grid-two">
            <div className="rh-card">
              <h3>Who we are</h3>
              <p>
                Red Harbor is a local IWW branch organizing in Aberdeen, Hoquiam,
                Grays Harbor, and the surrounding region. This branch is part of
                the re establishment of local wobbly organizing on the Harbor after
                a long absence.
              </p>
            </div>

            <div className="rh-card">
              <h3>What we believe</h3>
              <p>
                We believe workers build power collectively, act directly, and fight
                where power is actually felt: on the job, in shared conditions, and
                in organized relationships with each other. We do not wait for
                institutions to rescue us.
              </p>
            </div>

            <div className="rh-card">
              <h3>Who this organizing is for</h3>
              <p>
                Our organizing is not limited to narrow ideas of who counts as a
                worker. It is meant to benefit people in workplaces, people without
                stable employment, people living on the streets, and others whose
                time and lives are shaped by class power.
              </p>
            </div>

            <div className="rh-card">
              <h3>What we are trying to build</h3>
              <p>
                We are building a durable local organization rooted in solidarity,
                labor education, workplace organizing, and practical support for
                struggle on the Harbor. The aim is not just reaction, but lasting
                worker capacity.
              </p>
            </div>
          </div>
        </section>

        <section id="history" className="rh-section rh-section-band">
          <div className="rh-section-head">
            <p className="rh-section-kicker">History</p>
            <h2>Rooted in Harbor labor history</h2>
          </div>

          <div className="rh-grid-two">
            <div className="rh-card">
              <h3>A place with a real union history</h3>
              <p>
                Grays Harbor was once one of the most densely unionized regions in
                the Pacific Northwest. Early IWW organizing here drew strength from
                lumber workers, immigrant workers, and others excluded or ignored by
                narrower craft union structures.
              </p>
            </div>

            <div className="rh-card">
              <h3>Not starting from nothing</h3>
              <p>
                The Harbor’s history includes the Aberdeen free speech fight,
                organizing among timber workers, and major struggles against bosses,
                vigilantes, and civic repression. Red Harbor is building with that
                memory intact rather than pretending local labor history began
                yesterday.
              </p>
            </div>
          </div>
        </section>

        <section id="join" className="rh-section">
          <div className="rh-section-head">
            <p className="rh-section-kicker">Join</p>
            <h2>Organize with us</h2>
          </div>

          <div className="rh-grid-three">
            <article className="rh-card">
              <h3>Join the branch</h3>
              <p>
                Become part of the Red Harbor branch and plug into meetings,
                campaigns, education, and collective support.
              </p>
              <SectionLink id="contact" className="rh-inline-link">Contact the branch</SectionLink>
            </article>

            <article className="rh-card">
              <h3>Organize your workplace</h3>
              <p>
                If you want help organizing on the job, reach out. We can help you
                start carefully, map relationships, and build toward collective
                action with structure and discipline.
              </p>
              <SectionLink id="contact" className="rh-inline-link">Get organizing support</SectionLink>
            </article>

            <article className="rh-card">
              <h3>Build solidarity beyond the shop</h3>
              <p>
                This branch also makes room for people pushed outside stable work,
                because class struggle does not begin and end with a payroll system.
              </p>
              <SectionLink id="contact" className="rh-inline-link">Get involved</SectionLink>
            </article>
          </div>
        </section>

        <section id="bulletin" className="rh-section rh-section-band">
          <div className="rh-section-head">
            <p className="rh-section-kicker">Bulletin</p>
            <h2>Publications and updates</h2>
          </div>

          <div className="rh-bulletin-feature">
            <article className="rh-card rh-feature-card">
              <p className="rh-feature-kicker">Featured bulletin</p>
              <h3>The Aberdeen IWW Is Back</h3>
              <p>
                After nearly one hundred years, the branch has returned to the Harbor
                to reclaim labor organizing that it describes as part of the region’s
                own tradition. The public statement frames this return not as nostalgia,
                but as a practical effort to rebuild local worker power. It says the
                branch wants to organize broadly, study past struggles on the Harbor,
                and refuse the pattern of being driven out again.
              </p>
              <p>
                The statement also pushes beyond narrow definitions of the worker,
                arguing that organizing should benefit people with jobs, people without
                employment, people living on the streets, and others whose lives are
                shaped by exploitation and class power. It describes agitation,
                education, and organization as necessary until everyone has what they
                need.
              </p>
              <div className="rh-feature-quote">
                <p>
                  “We intend to study and learn from our past struggles on the Harbor
                  and do not intend to be ran out of town again.”
                </p>
              </div>
            </article>

            <div className="rh-grid-two rh-bulletin-sidegrid">
              {bulletinSidePosts.map((post) => (
                <article className="rh-card" key={post.title}>
                  <h3>{post.title}</h3>
                  <p>{post.body}</p>
                  <SectionLink id={post.sectionId} className="rh-inline-link">Read more</SectionLink>
                </article>
              ))}
            </div>
          </div>

          <div className="rh-grid-two" style={{ marginTop: 18 }}>
            <article className="rh-card">
              <h3>From Red Harbor</h3>
              <p>
                The historical excerpt on the Aberdeen site describes Grays Harbor as
                one of the most densely unionized regions in the Pacific Northwest in
                the early twentieth century, while also noting that the established
                trade union movement excluded large parts of the working class.
              </p>
            </article>

            <article className="rh-card">
              <h3>Why the history matters</h3>
              <p>
                That same history explains why the IWW mattered here. It organized
                across race, sex, and skill lines, grew through the Aberdeen Free
                Speech Fight, and faced coordinated repression from employers,
                chambers of commerce, vigilantes, and police power.
              </p>
            </article>
          </div>

          <div className="rh-note-wrap">
            <p className="rh-note">
              This public bulletin area is the new home for branch statements,
              updates, event notes, archive material, and adapted historical content
              currently living on the Aberdeen IWW Noblogs site.
            </p>
          </div>
        </section>

        <section id="events" className="rh-section">
          <div className="rh-section-head">
            <p className="rh-section-kicker">Events</p>
            <h2>Meetings and public activity</h2>
          </div>
          <div className="rh-card">
            <ul className="rh-event-list">
              {events.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        <section id="contact" className="rh-section rh-section-band">
          <div className="rh-section-head">
            <p className="rh-section-kicker">Contact</p>
            <h2>Get in touch</h2>
          </div>
          <div className="rh-grid-two">
            <div className="rh-card">
              <h3>Public contact</h3>
              <p>
                Use this section for public email, branch contact instructions, or
                an intake form for workers who want to talk about organizing.
              </p>
            </div>
            <div className="rh-card">
              <h3>Member access</h3>
              <p>
                Existing members can use the private branch board for internal
                updates, documents, meetings, requests, and branch coordination.
              </p>
              <Link to="/signin" className="rh-btn rh-btn-primary">Go to Member Sign In</Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="rh-public-footer">
        <div>
          <strong>Red Harbor</strong>
          <p>Industrial Workers of the World</p>
        </div>
        <div className="rh-footer-links">
          <SectionLink id="about" className="rh-footer-link-button">About</SectionLink>
          <SectionLink id="join" className="rh-footer-link-button">Join</SectionLink>
          <SectionLink id="bulletin" className="rh-footer-link-button">Bulletin</SectionLink>
          <SectionLink id="events" className="rh-footer-link-button">Events</SectionLink>
          <SectionLink id="contact" className="rh-footer-link-button">Contact</SectionLink>
          <Link to="/signin">Member Sign In</Link>
        </div>
      </footer>
    </div>
  );
}