import React from "react";
import { Link } from "react-router-dom";
import "../styles/redharbor-public-pass1.css";

const articleList = [
  {
    title: "The Aberdeen IWW Is Back",
    date: "October 2023",
    summary:
      "A public statement marking the return of the branch to the Harbor, outlining its goals, its broader view of who organizing should benefit, and its commitment to learning from past struggles.",
    sectionId: "bulletin-feature",
  },
  {
    title: "The IWW and The Hobo, A History",
    date: "October 2023",
    summary:
      "A historical reading and reference post connecting local labor memory to broader IWW traditions, migration, and working class struggle.",
    sectionId: "bulletin-archive",
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
                Grays Harbor was one of the most densely unionized regions in the
                Pacific Northwest, and IWW organizing on the Harbor grew through
                conflicts like the Aberdeen Free Speech Fight and timber struggles
                in the early twentieth century.
              </p>
            </div>

            <div className="rh-card">
              <h3>Not starting from nothing</h3>
              <p>
                Red Harbor is building with that history intact rather than acting
                like local labor memory has to be invented from scratch every few
                years by whoever just discovered a serif font.
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

          <div className="rh-bulletin-layout">
            <article id="bulletin-feature" className="rh-article">
              <div className="rh-article-meta">
                <span className="rh-article-tag">Featured bulletin</span>
                <span className="rh-article-date">October 2023</span>
              </div>

              <h3 className="rh-article-title">The Aberdeen IWW Is Back</h3>

              <p>
                After nearly one hundred years, the branch announced its return to
                the Harbor to reclaim a local tradition of radical labor organizing.
                The statement presents that return as practical rather than nostalgic:
                rebuild worker power here, study prior struggles here, and refuse the
                cycle of being run out of town again.
              </p>

              <p>
                The statement also makes a point that matters. It does not treat the
                category of “worker” as a sacred little box. It argues that organizing
                should benefit people with jobs, people without employment, people
                living on the streets, and others whose lives are shaped by class
                domination and exploitation.
              </p>

              <blockquote className="rh-article-quote">
                We intend to study and learn from our past struggles on the Harbor
                and do not intend to be ran out of town again.
              </blockquote>

              <p>
                The result is a public declaration of intent: remember the Harbor’s
                labor history, reclaim a place for radical organizing, and keep
                agitating, educating, and organizing until people have what they need.
              </p>
            </article>

            <aside className="rh-article-list" id="bulletin-archive">
              <h3 className="rh-article-list-title">More bulletin posts</h3>

              {articleList.map((post) => (
                <article className="rh-article-list-item" key={post.title}>
                  <div className="rh-article-list-meta">{post.date}</div>
                  <h4>{post.title}</h4>
                  <p>{post.summary}</p>
                  <SectionLink id={post.sectionId} className="rh-inline-link">
                    Read post
                  </SectionLink>
                </article>
              ))}
            </aside>
          </div>

          <div className="rh-note-wrap">
            <p className="rh-note">
              This bulletin area is the new home for branch statements, archive
              material, public updates, and adapted historical writing currently
              living on the Aberdeen IWW Noblogs site.
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