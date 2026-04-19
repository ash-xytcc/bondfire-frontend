import React from "react";
import { Link } from "react-router-dom";
import "../styles/redharbor-public-pass1.css";
import "../styles/redharbor-membership.css";

const REDCARD_URL = "https://redcard.iww.org/";

const duesTiers = [
  { name: "Minimum dues", income: "Less than $2,000 per month", amount: "$11/mo" },
  { name: "Regular dues", income: "$2,000 to $3,500 per month", amount: "$22/mo" },
  { name: "Maximum dues", income: "More than $3,500 per month", amount: "$33/mo" },
];

const reasons = [
  {
    title: "A real union connection",
    body: "Joining gives you a union home, not just a mailing list. You get a path into branch life, organizing, and shared struggle.",
  },
  {
    title: "Organizing support",
    body: "Workers trying to organize on the job need more than courage. They need structure, strategy, and other workers behind them.",
  },
  {
    title: "Political education",
    body: "The branch is a place to learn labor history, organizing practice, and how to build collective power deliberately.",
  },
  {
    title: "Solidarity beyond one shop",
    body: "The IWW is built around worker solidarity across jobs, industries, and conditions, not just one workplace at a time.",
  },
];

export default function MembershipPage() {
  return (
    <div className="rh-public rh-membership-page">
      <header className="rh-public-header">
        <div className="rh-public-brand">
          <img
            src="/red-harbor-logo.png"
            alt="Red Harbor logo"
            className="rh-public-logo"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
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
        <section className="rh-section rh-membership-shell">
          <div className="rh-membership-intro">
            <p className="rh-section-kicker">Membership</p>
            <h1 className="rh-membership-heading">Join the IWW through Red Harbor</h1>
            <p className="rh-section-copy">
              Join the One Big Union, connect with a local branch, and plug into workplace organizing,
              political education, and worker solidarity on the harbor and beyond.
            </p>
          </div>

          <div className="rh-card rh-membership-start-card rh-membership-entry-card">
            <h3>Start here</h3>
            <p>
              New memberships are handled through Redcard. Join there, then connect back into Red Harbor and branch life.
            </p>
            <div className="rh-membership-buttons">
              <a href={REDCARD_URL} className="rh-btn rh-btn-primary" target="_blank" rel="noopener noreferrer">
                Join now
              </a>
              <Link to="/" className="rh-btn rh-btn-secondary">
                Back to homepage
              </Link>
            </div>
          </div>
        </section>

        <section className="rh-section">
          <div className="rh-section-head">
            <p className="rh-section-kicker">Who can join</p>
            <h2>Workers belong here</h2>
            <p className="rh-section-copy">
              The IWW is for workers, not employers. That includes workers with jobs, unemployed workers,
              students, retirees, self employed workers, informal workers, and workers who cannot currently work.
              People with real hiring and firing power over other workers are treated as employers and are not eligible.
            </p>
          </div>

          <div className="rh-membership-two">
            <div className="rh-card">
              <h3>Who this includes</h3>
              <ul className="rh-event-list">
                <li>Workers currently on the job</li>
                <li>Unemployed and underemployed workers</li>
                <li>Students and retirees</li>
                <li>Self employed and informal workers</li>
                <li>Workers already in another union, except officers</li>
              </ul>
            </div>

            <div className="rh-card">
              <h3>Why that matters</h3>
              <p>
                The point is worker solidarity. Membership is centered on workers so that organizing stays rooted in shared material interests and collective action.
              </p>
            </div>
          </div>
        </section>

        <section className="rh-section rh-section-band">
          <div className="rh-section-head">
            <p className="rh-section-kicker">Why join</p>
            <h2>More than a card</h2>
            <p className="rh-section-copy">
              Membership should lead somewhere: branch connection, organizing support, education, and durable solidarity.
            </p>
          </div>

          <div className="rh-membership-two">
            {reasons.map((item) => (
              <article className="rh-card" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rh-section rh-membership-bottom-section">
          <div className="rh-membership-bottom-shell">
            <div className="rh-membership-bottom-main">
              <div className="rh-section-head">
                <p className="rh-section-kicker">Dues</p>
                <h2>Scaled by income</h2>
                <p className="rh-section-copy">
                  Current dues are based on self reported monthly income. The first month also includes an initiation fee equal to one month of dues.
                </p>
              </div>

              <div className="rh-membership-three">
                {duesTiers.map((tier) => (
                  <article className="rh-card rh-dues-card" key={tier.name}>
                    <p className="rh-section-kicker">{tier.name}</p>
                    <h3>{tier.amount}</h3>
                    <p>{tier.income}</p>
                  </article>
                ))}
              </div>
            </div>

            <aside className="rh-card rh-membership-start-card rh-membership-final-card">
              <p className="rh-section-kicker">Join the IWW</p>
              <h2>Ready to get your red card?</h2>
              <p className="rh-section-copy">
                Redcard handles the membership sign up. Once you are in, Red Harbor can be part of where that membership actually lives.
              </p>
              <div className="rh-membership-buttons">
                <a href={REDCARD_URL} className="rh-btn rh-btn-primary" target="_blank" rel="noopener noreferrer">
                  Join via Redcard
                </a>
                <Link to="/" className="rh-btn rh-btn-secondary">
                  Back to homepage
                </Link>
              </div>
            </aside>
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
