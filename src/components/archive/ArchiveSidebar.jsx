import React from "react";

export default function ArchiveSidebar({
  title,
  subtitle,
  query,
  setQuery,
  collections,
  activeId,
  setActiveId,
}) {
  const grouped = collections.reduce((acc, item) => {
    const key = item.year ? String(item.year) : "Undated";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const years = Object.keys(grouped).sort((a, b) => {
    if (a === "Undated") return 1;
    if (b === "Undated") return -1;
    return Number(a) - Number(b);
  });

  return (
    <aside className="lha-sidebar">
      <div className="lha-sidebar-top">
        <div className="lha-kicker">Red Harbor archive</div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>

      <label className="lha-search-wrap">
        <span>Search archive</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search year, event, keyword..."
          className="lha-search"
        />
      </label>

      <div className="lha-sidebar-list">
        {years.length ? (
          years.map((year) => (
            <section key={year} className="lha-sidebar-group">
              <h2>{year}</h2>
              <div className="lha-sidebar-items">
                {grouped[year].map((item) => {
                  const active = item.id === activeId;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveId(item.id)}
                      className={`lha-sidebar-item ${active ? "is-active" : ""}`}
                    >
                      <strong>{item.title}</strong>
                      {item.event ? <span>{item.event}</span> : null}
                    </button>
                  );
                })}
              </div>
            </section>
          ))
        ) : (
          <div className="lha-empty">Nothing matched your search.</div>
        )}
      </div>
    </aside>
  );
}
