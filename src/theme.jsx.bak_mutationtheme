import React from "react";

const ThemeCtx = React.createContext({
  theme: "light",
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

function applyTheme(theme) {
  const rootEl = document.documentElement;
  const body = document.body;
  const app = document.getElementById("root");

  const dark = theme === "dark";
  const bg = dark ? "#121715" : "#f3efe8";
  const text = dark ? "#f3efe8" : "#111111";

  rootEl.setAttribute("data-theme", theme);
  body.setAttribute("data-theme", theme);

  rootEl.style.backgroundColor = bg;
  rootEl.style.color = text;

  body.style.backgroundColor = bg;
  body.style.color = text;

  if (app) {
    app.style.backgroundColor = bg;
    app.style.color = text;
    app.style.minHeight = "100vh";
  }

  window.__BF_THEME_DEBUG__ = {
    theme,
    rootBg: app ? getComputedStyle(app).backgroundColor : null,
    bodyBg: getComputedStyle(body).backgroundColor,
    htmlBg: getComputedStyle(rootEl).backgroundColor,
  };
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = React.useState(getInitialTheme);

  React.useEffect(() => {
    applyTheme(theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {}
  }, [theme]);

  const toggleTheme = React.useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  return (
    <ThemeCtx.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeCtx.Provider>
  );
}

export function useTheme() {
  return React.useContext(ThemeCtx);
}
