import React from "react";
import "../styles/redharbor-public-pass1.css";

const bulletinPosts = [
  {
    title: "Branch Bulletin",
    body: "Read statements, updates, event notes, and organizing news from the Red Harbor branch.",
    href: "#bulletin",
  },
  {
    title: "Workplace Organizing",
    body: "Learn how to start organizing on the job, talk with co workers, and build a campaign with structure.",
    href: "#join",
  },
  {
    title: "Get Involved",
    body: "Join the branch, attend events, or reach out if you want to help build worker power on the harbor.",
    href: "#contact",
  },
];

const events = [
  "Branch meetings and public events will be posted here.",
  "Workplace organizing support and one to one follow up available.",
  "Bulletin updates and announcements published on a regular basis.",
];

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
          <a href="#about">About</a>
          <a href="#join">Join</a>
          <a href="#bulletin">Bulletin</a>
          <a href="#events">Events</a>
          <a href="#contact">Contact</a>
          <a href="/signin" className="rh-signin-link">Member Sign In</a>
        </nav>
      </header>

      <main>
        <section className="rh-hero">
          <div className="rh-hero-copy">
            <p className="rh-eyebrow">Red Harbor Branch</p>
            <h1>Building worker power on the harbor and beyond.</h1>
            <p className="rh-lead">
              Red Harbor is a branch of the Industrial Workers of the World.
              We organize across workplaces, support workers in struggle, publish branch updates,
              and build solidarity rooted in direct action and rank and file power.
            </p>
            <div className="rh-hero-actions">
              <a href="#join" className="rh-btn rh-btn-primary">Join Us</a>
              <a href="#bulletin" className="rh-btn rh-btn-secondary">Read the Bulletin</a>
              <a href="/signin" className="rh-btn rh-btn-ghost">Member Area</a>
            </div>
          </div>

          <aside className="rh-hero-card">
            <h2>What this site is for</h2>
            <ul>
              <li>Learn what the branch is and what it does</li>
              <li>Find organizing and membership information</li>
              <li>Read public updates and branch publications</li>
              <li>Access the private member board through sign in</li>
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
                Red Harbor is the local IWW branch building organization, education, and solidarity
                among workers in Aberdeen, Hoquiam, Grays Harbor, and the surrounding region.
              </p>
            </div>
            <div className="rh-card">
              <h3>What we believe</h3>
              <p>
                We believe workers should organize collectively, act directly, and build power
                at the point of struggle instead of waiting for institutions to rescue us.
              </p>
            </div>
            <div className="rh-card">
              <h3>Our mission</h3>
              <p>
                We support workplace organizing, mutual aid, labor education, and branch activity
                that strengthens working class power in public and private life.
              </p>
            </div>
            <div className="rh-card">
              <h3>Branch history</h3>
              <p>
                This section is ready for the Aberdeen IWW and Red Harbor history material you want
                to port over from the current public site.
              </p>
            </div>
          </div>
        </section>

        <section id="join" className="rh-section rh-section-band">
          <div className="rh-section-head">
            <p className="rh-section-kicker">Join</p>
            <h2>Organize with us</h2>
          </div>
          <div className="rh-grid-three">
            <article className="rh-card">
              <h3>Join the branch</h3>
              <p>
                Become part of the Red Harbor branch and plug into meetings, campaigns,
                education, and organizing support.
              </p>
              <a href="#contact" className="rh-inline-link">Contact the branch</a>
            </article>
            <article className="rh-card">
              <h3>Organize your workplace</h3>
              <p>
                If you want help organizing on the job, reach out. We can help you start carefully,
                map relationships, and build toward collective action.
              </p>
              <a href="#contact" className="rh-inline-link">Get organizing support</a>
            </article>
            <article className="rh-card">
              <h3>Support broader struggle</h3>
              <p>
                Workers, tenants, precarious workers, and unemployed workers all deserve organization,
                dignity, and solidarity. There is room to build.
              </p>
              <a href="#contact" className="rh-inline-link">Get involved</a>
            </article>
          </div>
        </section>

        <section id="bulletin" className="rh-section">
          <div className="rh-section-head">
            <p className="rh-section-kicker">Bulletin</p>
            <h2>Publications and updates</h2>
          </div>
          <div className="rh-grid-three">
            {bulletinPosts.map((post) => (
              <article className="rh-card" key={post.title}>
                <h3>{post.title}</h3>
                <p>{post.body}</p>
                <a href={post.href} className="rh-inline-link">Read more</a>
              </article>
            ))}
          </div>
          <p className="rh-note">
            This section is where we will port over bulletin material, statements, archive posts,
            and publication links from the current Noblogs site.
          </p>
        </section>

        <section id="events" className="rh-section rh-section-band">
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

        <section id="contact" className="rh-section">
          <div className="rh-section-head">
            <p className="rh-section-kicker">Contact</p>
            <h2>Get in touch</h2>
          </div>
          <div className="rh-grid-two">
            <div className="rh-card">
              <h3>Branch contact</h3>
              <p>
                Use this section for your public email, intake form, or branch contact instructions.
                We can wire the real contact flow next.
              </p>
            </div>
            <div className="rh-card">
              <h3>Member access</h3>
              <p>
                Existing members can use the private branch board for internal updates,
                documents, meetings, and announcements.
              </p>
              <a href="/signin" className="rh-btn rh-btn-primary">Go to Member Sign In</a>
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
          <a href="#about">About</a>
          <a href="#join">Join</a>
          <a href="#bulletin">Bulletin</a>
          <a href="#events">Events</a>
          <a href="#contact">Contact</a>
          <a href="/signin">Member Sign In</a>
        </div>
      </footer>
    </div>
  );
}
