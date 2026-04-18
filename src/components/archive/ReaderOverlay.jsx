import React, { useEffect, useMemo, useRef, useState } from "react";

export default function ReaderOverlay({
  open,
  onClose,
  collection,
  initialIndex = 0,
}) {
  const pages = useMemo(() => collection?.pages || [], [collection]);
  const [pageIndex, setPageIndex] = useState(initialIndex);
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  useEffect(() => {
    setPageIndex(initialIndex);
  }, [initialIndex, collection?.id]);

  useEffect(() => {
    if (!open) return;

    const onKey = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") setPageIndex((value) => Math.max(0, value - 1));
      if (event.key === "ArrowRight") setPageIndex((value) => Math.min(pages.length - 1, value + 1));
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, pages.length]);

  if (!open || !collection || !pages.length) return null;

  const page = pages[pageIndex];
  const start = Math.max(0, pageIndex - 2);
  const end = Math.min(pages.length, pageIndex + 3);
  const visiblePages = pages.slice(start, end);

  const goPrev = () => setPageIndex((value) => Math.max(0, value - 1));
  const goNext = () => setPageIndex((value) => Math.min(pages.length - 1, value + 1));

  const handleTouchStart = (event) => {
    const touch = event.touches[0];
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
  };

  const handleTouchEnd = (event) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - touchStartX.current;
    const dy = touch.clientY - touchStartY.current;
    touchStartX.current = null;
    touchStartY.current = null;
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
    if (dx < 0) goNext();
    else goPrev();
  };

  return (
    <div className="lha-reader">
      <div className="lha-reader-top">
        <div className="lha-reader-meta">
          <div className="lha-reader-kicker">Full reader</div>
          <div className="lha-reader-title">{collection.title}</div>
          <div className="lha-reader-sub">Page {pageIndex + 1} of {pages.length}</div>
        </div>

        <div className="lha-reader-actions">
          <button onClick={goPrev} disabled={pageIndex === 0}>Prev</button>
          <button onClick={goNext} disabled={pageIndex === pages.length - 1}>Next</button>
          <button className="is-primary" onClick={onClose}>Close</button>
        </div>
      </div>

      <div
        className="lha-reader-stage"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={page.src}
          alt={page.title || `Page ${pageIndex + 1}`}
          className="lha-reader-image"
        />
      </div>

      <div className="lha-reader-footer">
        <button onClick={goPrev} disabled={pageIndex === 0}>Prev</button>

        {start > 0 ? (
          <button onClick={() => setPageIndex(0)}>1</button>
        ) : null}

        {start > 1 ? <span>…</span> : null}

        {visiblePages.map((item, offset) => {
          const index = start + offset;
          return (
            <button
              key={`${item.src}-${index}`}
              className={index === pageIndex ? "is-active" : ""}
              onClick={() => setPageIndex(index)}
            >
              {index + 1}
            </button>
          );
        })}

        {end < pages.length - 1 ? <span>…</span> : null}

        {end < pages.length ? (
          <button onClick={() => setPageIndex(pages.length - 1)}>
            {pages.length}
          </button>
        ) : null}

        <button onClick={goNext} disabled={pageIndex === pages.length - 1}>Next</button>
      </div>
    </div>
  );
}
