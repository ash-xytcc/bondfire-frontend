import React from "react";

const ThemeCtx = React.createContext({
  theme: "dark",
  setTheme: () => {},
  toggleTheme: () => {},
});

function applyAlwaysDark() {
  const root = document.documentElement;
  const body = document.body;
  const app = document.getElementById("root");

  const vars = {
    "--bg": "#121715",
    "--bg-elev": "#1a211e",
    "--text": "#f3efe8",
    "--muted": "#b8c1cc",
    "--border": "rgba(255,255,255,0.14)",
    "--accent": "#c7e6d2",
    "--input-bg": "#202825",
    "--input-text": "#f3efe8",
  };

  root.setAttribute("data-theme", "dark");
  body.setAttribute("data-theme", "dark");
  root.classList.add("theme-dark");
  body.classList.add("theme-dark");

  Object.entries(vars).forEach(([k, v]) => {
    root.style.setProperty(k, v);
  });

  root.style.backgroundColor = vars["--bg"];
  root.style.color = vars["--text"];
  body.style.backgroundColor = vars["--bg"];
  body.style.color = vars["--text"];

  if (app) {
    app.style.backgroundColor = vars["--bg"];
    app.style.color = vars["--text"];
    app.style.minHeight = "100vh";
  }
}

export function ThemeProvider({ children }) {
  React.useEffect(() => {
    applyAlwaysDark();
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
