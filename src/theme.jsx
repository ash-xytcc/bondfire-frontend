import React from "react";

const ThemeCtx = React.createContext({
  theme: "light",
  setTheme: () => {},
  toggleTheme: () => {},
});

const STORAGE_KEY = "bf_theme";

function getInitialTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {}
  return "light";
}

function themeTokens(theme) {
  const dark = theme === "dark";
  return {
    dark,
    bg: dark ? "#121715" : "#f3efe8",
    elev: dark ? "#1a211e" : "#faf7f2",
    text: dark ? "#f3efe8" : "#111111",
    muted: dark ? "#b8c1cc" : "#4e647d",
    border: dark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.12)",
    accent: dark ? "#c7e6d2" : "#173f35",
    inputBg: dark ? "#202825" : "#fffdf9",
    inputText: dark ? "#f3efe8" : "#111111",
  };
}

function setVars(root, t) {
  root.style.setProperty("--bg", t.bg);
  root.style.setProperty("--bg-elev", t.elev);
  root.style.setProperty("--text", t.text);
  root.style.setProperty("--muted", t.muted);
  root.style.setProperty("--border", t.border);
  root.style.setProperty("--accent", t.accent);
  root.style.setProperty("--input-bg", t.inputBg);
  root.style.setProperty("--input-text", t.inputText);
}

function forceStyle(el, styles) {
  if (!el) return;
  Object.entries(styles).forEach(([k, v]) => {
    el.style.setProperty(k, v, "important");
  });
}

function applyTheme(theme) {
  const t = themeTokens(theme);
  const root = document.documentElement;
  const body = document.body;
  const app = document.getElementById("root");

  root.setAttribute("data-theme", theme);
  body.setAttribute("data-theme", theme);
  root.classList.remove("theme-light", "theme-dark");
  body.classList.remove("theme-light", "theme-dark");
  root.classList.add(t.dark ? "theme-dark" : "theme-light");
  body.classList.add(t.dark ? "theme-dark" : "theme-light");

  setVars(root, t);

  forceStyle(root, {
    "background-color": t.bg,
    "color": t.text,
  });

  forceStyle(body, {
    "background-color": t.bg,
    "color": t.text,
  });

  forceStyle(app, {
    "background-color": t.bg,
    "color": t.text,
    "min-height": "100vh",
  });

  const shellSelectors = [
    ".bf-auth-page",
    ".bf-auth-page.is-dpg",
    ".bf-auth-shell",
    ".bf-page",
    ".bf-main",
    ".bf-shell",
    ".bf-content",
    ".bf-workspace",
    ".bf-dashboard",
    ".bf-orgShell",
    ".bf-orgPage",
    ".bf-innerSanctum",
    "main",
    "section",
    "article"
  ];

  document.querySelectorAll(shellSelectors.join(",")).forEach((el) => {
    const isAuthShell = el.matches(".bf-auth-shell");
    forceStyle(el, {
      "background-color": isAuthShell ? t.elev : t.bg,
      "color": t.text,
      "border-color": t.border,
    });
  });

  document.querySelectorAll("input, textarea, select").forEach((el) => {
    forceStyle(el, {
      "background-color": t.inputBg,
      "color": t.inputText,
      "border-color": t.border,
    });
  });

  document.querySelectorAll(".bf-appHeader, .bf-appHeader.is-dpg, .bf-appnav, .bf-appnav.is-drawer, .bf-drawer-panel").forEach((el) => {
    forceStyle(el, {
      "color": t.text,
      "border-color": t.border,
    });
  });

  document.querySelectorAll(".bf-appnav-link").forEach((el) => {
    forceStyle(el, {
      "color": t.text,
      "border-color": t.border,
    });
  });

  document.querySelectorAll(".bf-logout, .bf-hamburger, .bf-drawer-close, .btn, .btn-red").forEach((el) => {
    forceStyle(el, {
      "border-color": t.border,
    });
  });

  window.__BF_THEME_DEBUG__ = {
    theme,
    rootBg: app ? getComputedStyle(app).backgroundColor : null,
    bodyBg: getComputedStyle(body).backgroundColor,
    htmlBg: getComputedStyle(root).backgroundColor,
  };
}

let observer = null;
function startObserver(theme) {
  if (observer) observer.disconnect();
  observer = new MutationObserver(() => {
    applyTheme(theme);
  });
  observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["class", "style"],
  });
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = React.useState(getInitialTheme);

  React.useEffect(() => {
    applyTheme(theme);
    startObserver(theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {}
    return () => {
      if (observer) observer.disconnect();
    };
  }, [theme]);

  const setTheme = React.useCallback((next) => {
    setThemeState(next === "dark" ? "dark" : "light");
  }, []);

  const toggleTheme = React.useCallback(() => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  const value = React.useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme]
  );

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export function useTheme() {
  return React.useContext(ThemeCtx);
}
