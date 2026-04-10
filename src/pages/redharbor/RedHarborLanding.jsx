import React from "react";
import RedHarborHero from "../../components/redharbor/RedHarborHero";

function Section({ title, children }) {
  return (
    <section className="card" style={{ padding: 20 }}>
      <h2 style={{ marginTop: 0 }}>{title}</h2>
      <div style={{ color: "var(--muted,#c9c9c9)", lineHeight: 1.6 }}>{children}</div>
    </section>
  );
}

export default function RedHarborLanding() {
  return (
    <main className="page-shell" style={{ display: "grid", gap: 16, maxWidth: 1100, margin: "0 auto", padding: 16 }}>
      <RedHarborHero />

      <Section title="what this branch is for">
        <p>
          Red Harbor is a small but growing union branch focused on worker outreach, organizing support,
          meetings, education, and building a durable local structure that can actually hold people.
        </p>
      </Section>

      <Section title="get involved">
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          <li>Join the branch</li>
          <li>Get updates and meeting info</li>
          <li>Reach out about workplace organizing</li>
          <li>Show up to events and trainings</li>
        </ul>
      </Section>

      <Section title="how this instance works">
        <p>
          Bondfire runs the internal coordination side. The public page shares information and sign-up paths.
          Sensitive internal records stay inside the private workspace.
        </p>
      </Section>
    </main>
  );
}
