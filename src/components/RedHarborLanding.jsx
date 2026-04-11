import React from "react";
import "./RedHarborLanding.css";

export default function RedHarborLanding() {
  return (
    <main className="rh-page">
      <section className="rh-hero">
<div className="rh-overlay" />
        <div className="rh-container rh-hero-inner">
          <div className="rh-kicker">Industrial Workers of the World</div>

          <h1>Red Harbor</h1>

          <p className="rh-subhead">
            A working class organization on Grays Harbor rooted in solidarity,
            direct action, mutual aid, and the belief that workers should run
            their own fights.
          </p>

          <div className="rh-hero-actions">
            <a className="rh-btn rh-btn-primary" href="#join">
              Join Us
            </a>
            <a className="rh-btn rh-btn-secondary" href="#organize">
              Organize Your Workplace
            </a>
            <a className="rh-btn rh-btn-secondary" href="/app/#/orgs">
              Sign In
            </a>
          </div>

          <div className="rh-hero-note">
            <span className="rh-note-line" />
            <p>An injury to one is an injury to all.</p>
          </div>
        </div>
      </section>

      <section className="rh-band">
        <div className="rh-container rh-band-grid">
          <div>
            <span className="rh-eyebrow">What kind of union</span>
            <h2>Solidarity unionism, not service unionism.</h2>
          </div>
          <p>
            We believe workers should take action for themselves, make decisions
            democratically, and keep power in the hands of the people affected,
            not outside staffers, lawyers, or bureaucrats.
          </p>
        </div>
      </section>

      <section className="rh-section" id="organize">
        <div className="rh-container rh-grid-2">
          <article className="rh-card">
            <span className="rh-eyebrow">About</span>
            <h3>Open to workers across industries</h3>
            <p>
              As a General Membership Branch, we organize workers from across
              the Harbor rather than splitting people apart by narrow job
              categories or trade silos.
            </p>
            <p>
              Industrial unionism means workers in the same workplace or the
              same industry fight together. It builds leverage, reduces
              fragmentation, and makes it harder for bosses to pit workers
              against one another.
            </p>
          </article>

          <article className="rh-card">
            <span className="rh-eyebrow">Method</span>
            <h3>Direct action is the center of the work</h3>
            <p>
              We do not rely exclusively on formal contract negotiations to win
              gains. Contracts matter when workers want them, but paper alone
              does not protect anyone. Organized workers do.
            </p>
            <p>
              The goal is to build solidarity, confidence, and practical
              organizing skill so people can act together where they are.
            </p>
          </article>
        </div>
      </section>

      <section className="rh-section rh-section-dark">
        <div className="rh-container">
          <div className="rh-section-heading">
            <span className="rh-eyebrow">Mission and values</span>
            <h2>Built for the full working class</h2>
            <p>
              Red Harbor organizes for the broad working class, including people
              left out, written off, or actively excluded by mainstream labor
              structures.
            </p>
          </div>

          <div className="rh-values-grid">
            <article className="rh-value">
              <h3>Solidarity</h3>
              <p>
                Shared struggle, shared stakes, shared responsibility. We are
                stronger when we act like our lives are tied together, because
                they are.
              </p>
            </article>

            <article className="rh-value">
              <h3>Mutual Aid</h3>
              <p>
                Material support through collective action, not charity from
                above. People keeping each other alive and capable of fighting.
              </p>
            </article>

            <article className="rh-value">
              <h3>Direct Democracy</h3>
              <p>
                Everyone affected should have a voice in shaping priorities,
                campaigns, and action. No passive membership model.
              </p>
            </article>

            <article className="rh-value">
              <h3>Non Traditional Organizing</h3>
              <p>
                We organize beyond narrow labor categories, including precarious
                workers, migrants, disabled people, and unhoused workers.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="rh-section" id="work">
        <div className="rh-container rh-grid-2">
          <article className="rh-feature-card" id="homeless-union">
            <span className="rh-eyebrow">Current work</span>
            <h2>Union work tied to community survival</h2>
            <p>
              Red Harbor connects organizing to concrete Harbor work: community
              support, food access, material aid, harm reduction, and direct
              help that builds real relationships instead of performative
              politics.
            </p>
            <p>
              This is not separate from labor struggle. It is part of how people
              survive long enough to fight together.
            </p>
            <a className="rh-text-link" href="#work">
              See current campaigns
            </a>
          </article>

          <article className="rh-feature-card">
            <span className="rh-eyebrow">Homeless union organizing</span>
            <h2>Organizing the people labor systems try to erase</h2>
            <p>
              We take seriously the work of organizing with unhoused people as
              participants in struggle, not just recipients of outreach. The
              goal is power, dignity, and structure, not pity.
            </p>
            <p>
              That commitment should be visible on the front page because it is
              part of what makes Red Harbor distinct.
            </p>
            <a className="rh-text-link" href="#homeless-union">
              Learn more
            </a>
          </article>
        </div>
      </section>

      <section className="rh-history" id="history">
        <div className="rh-container rh-grid-2">
          <div>
            <span className="rh-eyebrow">History</span>
            <h2>Grays Harbor has labor history worth naming directly</h2>
          </div>
          <div>
            <p>
              This region was shaped by timber, shipping, mills, and dangerous
              industrial labor. The Harbor is not just scenery. It is part of a
              long working class history that matters now.
            </p>
            <p>
              Red Harbor stands in that tradition while building something
              usable in the present.
            </p>
            <a className="rh-text-link" href="#history">
              Read Harbor labor history
            </a>
          </div>
        </div>
      </section>

      <section className="rh-section rh-cta-section" id="join">
        <div className="rh-container rh-cta-card">
          <div>
            <span className="rh-eyebrow">Get involved</span>
            <h2>Bring us your workplace, your shop floor, or your situation</h2>
            <p>
              You do not need to have everything figured out before reaching
              out. If you want to organize your workplace, need support, or want
              to connect with the branch, start here.
            </p>
          </div>

          <div className="rh-cta-actions">
            <a className="rh-btn rh-btn-primary" href="#join">
              New Member Application
            </a>
            <a className="rh-btn rh-btn-secondary" href="#organize">
              Start Organizing
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}