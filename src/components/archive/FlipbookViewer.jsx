import React, { useEffect, useRef, useState } from "react";
import HTMLFlipBook from "react-pageflip";

function LazyPage({ page, index, onOpenReader }) {
  const holderRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = holderRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "400px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={holderRef}
      className="lha-flip-page"
      onClick={() => onOpenReader(index)}
    >
      {visible ? (
        <img
          src={page.src}
          alt={page.title || `Page ${index + 1}`}
          className="lha-flip-image"
          loading="lazy"
          draggable={false}
        />
      ) : (
        <div className="lha-flip-loading">Loading page…</div>
      )}

      <div className="lha-page-badge">
        <div>Page {index + 1}</div>
        {page.title ? <div>{page.title}</div> : null}
      </div>
    </div>
  );
}

export default function FlipbookViewer({ collection, onOpenReader }) {
  const pages = collection?.pages || [];

  return (
    <div className="lha-flip-wrap">
      <HTMLFlipBook
        key={collection?.id || "empty"}
        width={390}
        height={570}
        size="stretch"
        minWidth={280}
        maxWidth={1100}
        minHeight={420}
        maxHeight={1500}
        showCover={true}
        mobileScrollSupport={true}
        drawShadow={true}
        usePortrait={true}
        startPage={0}
        flippingTime={700}
        disableFlipByClick={true}
        showPageCorners={false}
        className="lha-flipbook"
      >
        {pages.map((page, index) => (
          <div key={`${page.src}-${index}`} className="lha-flip-slot">
            <LazyPage page={page} index={index} onOpenReader={onOpenReader} />
          </div>
        ))}
      </HTMLFlipBook>
    </div>
  );
}
