import React from "react";

const ThemeCtx = React.createContext({
  theme: "dark",
  setTheme: () => {},
  toggleTheme: () => {},
});

function forceStyle(el, styles) {
  if (!el) return;
  for (const [k, v] of Object.entries(styles)) {
    el.style.setProperty(k, v, "important");
  }
}

function applyAlwaysDark() {
  const bg = "#121715";
  const elev = "#1a211e";
  const text = "#f3efe8";
  const border = "rgba(255,255,255,0.14)";
  const inputBg = "#202825";
  const accent = "#c7e6d2";

  const html = document.documentElement;
  const body = document.body;
  const root = document.getElementById("root");

  html.setAttribute("data-theme", "dark");
  body.setAttribute("data-theme", "dark");
  html.classList.add("theme-dark");
  body.classList.add("theme-dark");

  [
    [html, { "background-color": bg, color: text }],
    [body, { "background-color": bg, color: text }],
    [root, { "background-color": bg, color: text, "min-height": "100vh" }],
  ].forEach(([el, styles]) => forceStyle(el, styles));

  document.querySelectorAll(".card.bfDashCard, .card.bfDashPanel, .bfDashMeetingsPanel, .bfDashNeedsPanel").forEach((el) => {
    forceStyle(el, {
      "background-color": elev,
      color: text,
      "border-color": border,
      "box-shadow": "none",
    });
  });

  document.querySelectorAll(".card.bfDashCard *, .card.bfDashPanel *, .bfDashMeetingsPanel *, .bfDashNeedsPanel *").forEach((el) => {
    forceStyle(el, { color: text });
  });

  document.querySelectorAll("input, textarea, select").forEach((el) => {
    forceStyle(el, {
      "background-color": inputBg,
      color: text,
      "border-color": border,
    });
  });

  document.querySelectorAll("a").forEach((el) => {
    forceStyle(el, { color: accent });
  });

  window.__BF_DARK_DEBUG__ = {
    html: getComputedStyle(html).backgroundColor,
    body: getComputedStyle(body).backgroundColor,
    root: root ? getComputedStyle(root).backgroundColor : null,
    cards: Array.from(document.querySelectorAll(".card.bfDashCard, .card.bfDashPanel")).slice(0, 3).map((el) => getComputedStyle(el).backgroundColor),
  };
}

let bfDarkObserver = null;
let bfDarkInterval = null;

export function ThemeProvider({ children }) {
  React.useEffect(() => {
    applyAlwaysDark();

    if (bfDarkObserver) bfDarkObserver.disconnect();
    bfDarkObserver = new MutationObserver(() => {
      applyAlwaysDark();
    });
    bfDarkObserver.observe(document.documentElement, {
      subtree: true,
      childList: true,
      attributes: true,
    });

    if (bfDarkInterval) clearInterval(bfDarkInterval);
    bfDarkInterval = setInterval(() => {
      applyAlwaysDark();
    }, 700);

    return () => {
      if (bfDarkObserver) bfDarkObserver.disconnect();
      if (bfDarkInterval) clearInterval(bfDarkInterval);
    };
  }, []);

  return (
    <ThemeCtx.Provider
      value={{
        theme: "dark",
        setTheme: () => {},
        toggleTheme: () => {},
      }}
    >
      {children}
    </ThemeCtx.Provider>
  );
}

export function useTheme() {
  return React.useContext(ThemeCtx);
}
