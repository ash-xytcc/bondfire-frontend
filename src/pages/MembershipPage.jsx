import React from "react";
import { Link } from "react-router-dom";
import "../styles/redharbor-public-pass1.css";

const REDCARD_URL = "https://redcard.iww.org/";

const duesTiers = [
  {
    name: "Minimum",
    income: "If you make less than $2,000 per month",
    amount: "$11/mo",
  },
  {
    name: "Regular",
    income: "If you make between $2,000 and $3,500 per month",
    amount: "$22/mo",
  },
  {
    name: "Maximum",
    income: "If you make more than $3,500 per month",
    amount: "$33/mo",
  },
];

const reasons = [
  {
    title: "Organization",
    body: "Build real workplace power with the backing of a democratic, member-run union.",
  },
  {
    title: "Education",
    body: "Learn organizing skills from fellow workers, trainings, and branch experience.",
  },
  {
    title: "Solidarity",
    body: "Join something larger than a single workplace and stand with workers across industries.",
  },
  {
    title: "Community",
    body: "Connect with other workers committed to building a kinder, tougher, more organized future.",
  },
  {
    title: "Local branch connection",
    body: "Joining through Red Harbor means a path into branch meetings, branch life, and local support.",
  },
  {
    title: "Direct action culture",
    body: "The IWW is built around workers acting together, not waiting around to be rescued.",
  },
];

export default function MembershipPage() {
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
            <div className="rh-public-title">Red Harbor Membership</div>
          </div>
        </div>

        <nav className="rh-public-nav" aria-label="Primary">
          <Link to="/" className="rh-nav-link">Homepage</Link>
          <a href={REDCARD_URL} className="rh-signin-link" target="_blank" rel="noopener noreferrer">
            Join via Redcard
          </a>
        </nav>
      </header>

      <main>
        <section className="rh-section rh-membership-hero">
          <div className="rh-section-head">
            <p className="rh-section-kicker">Membership</p>
            <h1 className="rh-membership-title">Join the IWW through Red Harbor</h1>
            <p className="rh-section-copy rh-membership-copy">
              Join the One Big Union, connect with a local branch, and plug into workplace organizing,
              political education, and worker solidarity on the harbor and beyond.
            </p>
          </div>

          <div className="rh-hero-actions">
            <a href={REDCARD_URL} className="rh-btn rh-btn-primary" target="_blank" rel="noopener noreferrer">
              Join now
            </a>
            <Link to="/" className="rh-btn rh-btn-secondary">
              Back to homepage
            </Link>
          </div>
        </section>

        <section className="rh-section">
          <div className="rh-section-head">
            <p className="rh-section-kicker">Who can join</p>
            <h2>Workers belong here</h2>
            <p className="rh-section-copy">
              The IWW is open to workers, not employers. That includes workers with jobs, unemployed workers,
              students, retirees, self-employed workers, informal workers, and workers who cannot currently work.
              People with real hiring and firing power over other workers are treated as employers and are not eligible.
            </p>
          </div>

          <div className="rh-grid-two">
            <div className="rh-card">
              <h3>Who this includes</h3>
              <ul className="rh-event-list">
                <li>Workers currently on the job</li>
                <li>Unemployed and underemployed workers</li>
                <li>Students and retirees</li>
                <li>Self-employed and informal workers</li>
                <li>Workers already in another union, except officers</li>
              </ul>
            </div>

            <div className="rh-card">
              <h3>Why that matters</h3>
              <p>
                The point is worker solidarity. Limiting membership to workers makes it easier to organize
                together on the job and fight for shared material interests.
              </p>
            </div>
          </div>
        </section>

        <section className="rh-section rh-section-band">
          <div className="rh-section-head">
            <p className="rh-section-kicker">Why join</p>
            <h2>More than a card</h2>
            <p className="rh-section-copy">
              Joining should lead somewhere: workplace support, branch connection, organizing skills,
              and a real structure for acting with other workers.
            </p>
          </div>

          <div className="rh-grid-three">
            {reasons.map((item) => (
              <article className="rh-card" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rh-section">
          <div className="rh-section-head">
            <p className="rh-section-kicker">Dues</p>
            <h2>Scaled by income</h2>
            <p className="rh-section-copy">
              Current dues are based on self-reported monthly income. Your first month also includes an initiation fee
              equal to one month of dues.
            </p>
          </div>

          <div className="rh-grid-three">
            {duesTiers.map((tier) => (
              <article className="rh-card rh-dues-card" key={tier.name}>
                <p className="rh-section-kicker">{tier.name}</p>
                <h3>{tier.amount}</h3>
                <p>{tier.income}</p>
                <ul className="rh-event-list">
                  <li>Organizing support</li>
                  <li>IWW backing</li>
                  <li>Branch connection</li>
                  <li>Internal union updates</li>
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="rh-section rh-section-band">
          <div className="rh-card rh-membership-cta-card">
            <p className="rh-section-kicker">Join the IWW</p>
            <h2>Ready to get your red card?</h2>
            <p className="rh-section-copy">
              New memberships are handled through Redcard. Start there, then connect back into Red Harbor and branch life.
            </p>

            <div className="rh-hero-actions">
              <a href={REDCARD_URL} className="rh-btn rh-btn-primary" target="_blank" rel="noopener noreferrer">
                Join via Redcard
              </a>
              <Link to="/#join" className="rh-btn rh-btn-ghost">
                Back to join section
              </Link>
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
          <Link to="/">Homepage</Link>
          <a href={REDCARD_URL} target="_blank" rel="noopener noreferrer">Join via Redcard</a>
        </div>
      </footer>
    </div>
  );
}
