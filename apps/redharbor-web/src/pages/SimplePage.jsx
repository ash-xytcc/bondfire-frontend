export function SimplePage({ title, body }) {
  return (
    <section className="card stack">
      <h2>{title}</h2>
      <p>{body}</p>
    </section>
  );
}
