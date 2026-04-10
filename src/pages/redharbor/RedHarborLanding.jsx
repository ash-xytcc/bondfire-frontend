import React from "react";
import RedHarborHero from "../../components/redharbor/RedHarborHero";

function Section({ id, title, eyebrow, children }) {
  return (
    <section
      id={id}
      className="card"
      style={{
        padding: 22,
        border: "1px solid rgba(255,255,255,0.08)",
        scrollMarginTop: 84,
      }}
    >
      {eyebrow ? (
        <div
          className="helper"
          style={{
            marginBottom: 8,
            letterSpacing: 1.2,
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.6)",
            fontWeight: 700,
          }}
        >
          {eyebrow}
        </div>
      ) : null}

      <h2 style={{ marginTop: 0, marginBottom: 12, fontSize: "1.55rem" }}>{title}</h2>

      <div style={{ color: "var(--muted,#c9c9c9)", lineHeight: 1.7 }}>{children}</div>
    </section>
  );
}

function InfoCard({ title, children }) {
  return (
    <div
      style={{
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 16,
        padding: 16,
        background: "rgba(255,255,255,0.025)",
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: 8, fontSize: "1.02rem" }}>{title}</h3>
      <div style={{ color: "var(--muted,#c9c9c9)", lineHeight: 1.6 }}>{children}</div>
    </div>
  );
}

function LinkTile({ href, label, detail }) {
  return (
    <a
      href={href}
      style={{
        display: "block",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 16,
        padding: 16,
        textDecoration: "none",
        color: "inherit",
        background: "rgba(255,255,255,0.025)",
      }}
    >
      <div style={{ fontWeight: 800, marginBottom: 6 }}>{label}</div>
      <div style={{ color: "var(--muted,#c9c9c9)", lineHeight: 1.55 }}>{detail}</div>
    </a>
  );
}

export default function RedHarborLanding() {
  return (
    <main
      className="page-shell"
      style={{
        display: "grid",
        gap: 16,
        maxWidth: 1120,
        margin: "0 auto",
        padding: 16,
      }}
    >
      <RedHarborHero />

      <Section id="what-we-do" eyebrow="what we do" title="a local branch built for real organizing">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 12,
          }}
        >
          <InfoCard title="workplace support">
            Talk with workers about organizing on the job, mapping their workplace, and taking
            practical next steps toward collective power.
          </InfoCard>

          <InfoCard title="meetings and training">
            Hold branch meetings, organizer follow up, education, and skill building that help
            people move from sympathy to action.
          </InfoCard>

          <InfoCard title="mutual support">
            Keep a structure that can actually hold people through campaigns, emergencies, and the
            slow durable work of building trust.
          </InfoCard>

          <InfoCard title="local coordination">
            Maintain shared tools, documents, and internal operations without exposing sensitive
            branch information in public.
          </InfoCard>
        </div>
      </Section>

      <Section id="get-involved" eyebrow="get involved" title="several ways in, no performance required">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 12,
          }}
        >
          <InfoCard title="talk to an organizer">
            If you are dealing with problems at work, trying to get organized, or just want to know
            what support might look like, start there.
          </InfoCard>

          <InfoCard title="join the branch">
            If you are ready to plug into meetings, committee work, and local organizing, this is
            where that path starts.
          </InfoCard>

          <InfoCard title="volunteer skills or time">
            Design, research, logistics, outreach, food, rides, printing, tech. Branch work takes
            many forms and not all of them involve speeches.
          </InfoCard>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 16 }}>
          <a className="btn-red" href="/?app=red-harbor#/signin">Member Sign In</a>
          <a className="btn" href="mailto:redharbor@iww.org">Contact the Branch</a>
        </div>
      </Section>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.3fr) minmax(280px, 0.9fr)",
          gap: 16,
        }}
      >
        <Section id="meetings" eyebrow="meetings" title="public meeting rhythm">
          <div
            style={{
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 16,
              padding: 18,
              background: "rgba(255,255,255,0.025)",
            }}
          >
            <div style={{ fontSize: "0.92rem", opacity: 0.7, marginBottom: 8 }}>
              next branch meeting
            </div>
            <div style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: 8 }}>
              Thursday at 6:00 PM
            </div>
            <div style={{ color: "var(--muted,#c9c9c9)", lineHeight: 1.7 }}>
              General branch meeting for coordination, updates, and next steps. Replace this with
              real scheduling info once you are ready, but for demo purposes it makes the site feel
              alive instead of abandoned by civilization.
            </div>
          </div>
        </Section>

        <Section id="dues" eyebrow="dues" title="membership and dues">
          <p style={{ marginTop: 0 }}>
            Dues structure, member expectations, and branch joining info will live here. For now
            this block proves the site has a place for real union logistics, not just slogans.
          </p>
          <p style={{ marginBottom: 0 }}>
            When you are ready, we can turn this into a proper dues explainer with contact flow and
            branch specific language.
          </p>
        </Section>
      </div>

      <Section id="resources" eyebrow="resources" title="starting points for workers">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 12,
          }}
        >
          <LinkTile
            href="https://www.iww.org"
            label="industrial workers of the world"
            detail="National union information, principles, and broader context."
          />
          <LinkTile
            href="https://archive.iww.org"
            label="organizing resources"
            detail="Training material, campaigns, and practical labor organizing information."
          />
          <LinkTile
            href="mailto:redharbor@iww.org"
            label="contact red harbor"
            detail="Use a placeholder branch email for now. Swap this once you settle the real address."
          />
        </div>
      </Section>

      <Section id="contact" eyebrow="contact" title="contact and next step">
        <p style={{ marginTop: 0 }}>
          This public side is meant to be the front door. The private Bondfire backend is where the
          branch handles internal coordination, documents, meetings, and sensitive operations.
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 12 }}>
          <a className="btn-red" href="/?app=red-harbor#/signin">Sign In</a>
          <a className="btn" href="mailto:redharbor@iww.org">Email the Branch</a>
        </div>
      </Section>
    </main>
  );
}
