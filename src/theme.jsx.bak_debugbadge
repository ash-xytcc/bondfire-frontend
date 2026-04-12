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

function applyTheme(theme) {
  const rootEl = document.documentElement;
  const body = document.body;
  const app = document.getElementById("root");

  const dark = theme === "dark";

  const bg = dark ? "#121715" : "#f3efe8";
  const text = dark ? "#f3efe8" : "#111111";

  // set attributes (for future CSS if needed)
  rootEl.setAttribute("data-theme", theme);
  body.setAttribute("data-theme", theme);

  // FORCE background at every layer
  rootEl.style.backgroundColor = bg;
  body.style.backgroundColor = bg;

  if (app) {
    app.style.backgroundColor = bg;
    app.style.minHeight = "100vh";
  }

  rootEl.style.color = text;
  body.style.color = text;

  // DEBUG so we know it's firing
  console.log("[theme applied]", theme, bg);
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = React.useState(getInitialTheme);

  React.useEffect(() => {
    applyTheme(theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {}
  }, [theme]);

  const toggleTheme = React.useCallback(() => {
    setThemeState(prev => (prev === "dark" ? "light" : "dark"));
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
