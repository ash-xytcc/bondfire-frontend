import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ArchiveSidebar from "./ArchiveSidebar";
import FlipbookViewer from "./FlipbookViewer";
import ReaderOverlay from "./ReaderOverlay";
import "../../styles/labor-history.css";

export default function LaborArchiveRoot({
  collections = [],
  title = "Labor Archive",
  subtitle = "A browsable archive with flipbook browsing, searchable collections, and a full reader mode.",
}) {
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState(collections[0]?.id ?? null);
  const [readerOpen, setReaderOpen] = useState(false);
  const [readerIndex, setReaderIndex] = useState(0);

  const filteredCollections = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return collections;

    return collections.filter((collection) => {
      const pageText = (collection.pages || [])
        .flatMap((page) => [
          page.title || "",
          page.summary || "",
          ...(page.keywords || []),
        ])
        .join(" ");

      const text = [
        collection.title || "",
        collection.description || "",
        collection.year ? String(collection.year) : "",
        collection.event || "",
        ...(collection.tags || []),
        pageText,
      ]
        .join(" ")
        .toLowerCase();

      return text.includes(q);
    });
  }, [collections, query]);

  useEffect(() => {
    if (!filteredCollections.length) {
      setActiveId(null);
      return;
    }
    const stillVisible = filteredCollections.some((item) => item.id === activeId);
    if (!stillVisible) setActiveId(filteredCollections[0].id);
  }, [filteredCollections, activeId]);

  const activeCollection =
    filteredCollections.find((item) => item.id === activeId) ?? null;

  useEffect(() => {
    setReaderIndex(0);
  }, [activeId]);

  return (
    <div className="lha-page">
      <header className="lha-header">
        <div className="lha-brand">
          <img src="/red-harbor-logo.png" alt="Red Harbor logo" />
          <div>
            <div className="lha-brand-kicker">Industrial Workers of the World</div>
            <div className="lha-brand-title">Red Harbor Labor History</div>
          </div>
        </div>

        <nav className="lha-header-nav">
          <Link to="/">Back to homepage</Link>
          <Link to="/signin">Member Area</Link>
        </nav>
      </header>

      <div className="lha-layout">
        <ArchiveSidebar
          title={title}
          subtitle={subtitle}
          query={query}
          setQuery={setQuery}
          collections={filteredCollections}
          activeId={activeId}
          setActiveId={setActiveId}
        />

        <main className="lha-main">
          {activeCollection ? (
            <>
              <div className="lha-main-head">
                <div>
                  <div className="lha-tags">
                    {activeCollection.year ? (
                      <span className="lha-tag is-dark">{activeCollection.year}</span>
                    ) : null}
                    {activeCollection.event ? (
                      <span className="lha-tag">{activeCollection.event}</span>
                    ) : null}
                    {(activeCollection.tags || []).map((tag) => (
                      <span key={tag} className="lha-tag">{tag}</span>
                    ))}
                  </div>

                  <h2>{activeCollection.title}</h2>

                  {activeCollection.description ? (
                    <p>{activeCollection.description}</p>
                  ) : null}
                </div>

                <div className="lha-main-actions">
                  <button
                    type="button"
                    className="lha-btn-primary"
                    onClick={() => setReaderOpen(true)}
                  >
                    Open reader
                  </button>
                </div>
              </div>

              <FlipbookViewer
                collection={activeCollection}
                onOpenReader={(index) => {
                  setReaderIndex(index);
                  setReaderOpen(true);
                }}
              />
            </>
          ) : (
            <div className="lha-empty-state">
              No matching collections. Humanity remains undefeated in its war against metadata.
            </div>
          )}
        </main>
      </div>

      <ReaderOverlay
        open={readerOpen}
        onClose={() => setReaderOpen(false)}
        collection={activeCollection}
        initialIndex={readerIndex}
      />
    </div>
  );
}
