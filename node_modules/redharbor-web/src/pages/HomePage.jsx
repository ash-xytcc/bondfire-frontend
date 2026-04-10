export function HomePage() {
  return (
    <div className="stack">
      <section className="hero card">
        <p className="eyebrow">Public site starter</p>
        <h2>Organize. Learn. Get involved.</h2>
        <p>
          This is the first public shell for the Red Harbor instance. Replace this with real branch copy,
          events, and join pathways. Humans love leaving placeholder text in production, so maybe do not do that.
        </p>
        <div className="button-row">
          <a className="button" href="/get-involved">Join or Get Involved</a>
          <a className="button button-secondary" href="/contact">Contact the Branch</a>
        </div>
      </section>

      <section className="grid-2">
        <article className="card">
          <h3>For workers</h3>
          <p>Clear path for organizing help, contact, and support requests.</p>
        </article>
        <article className="card">
          <h3>For members</h3>
          <p>Link this site cleanly into the private ops center and internal resources.</p>
        </article>
      </section>
    </div>
  );
}
