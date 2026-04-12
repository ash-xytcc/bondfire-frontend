import React from "react";

const ThemeCtx = React.createContext({
  theme: "light",
  setTheme: () => {},
  toggleTheme: () => {},
});

const STORAGE_KEY = "bf_theme";
const STYLE_ID = "bf-runtime-theme-style";

function getInitialTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {}
  return "light";
}

function ensureRuntimeStyle() {
  let style = document.getElementById(STYLE_ID);
  if (!style) {
    style = document.createElement("style");
    style.id = STYLE_ID;
    document.head.appendChild(style);
  }
  return style;
}

function buildThemeCss(theme) {
  const dark = theme === "dark";

  const bg = dark ? "#121715" : "#f3efe8";
  const elev = dark ? "#1a211e" : "#faf7f2";
  const text = dark ? "#f3efe8" : "#111111";
  const muted = dark ? "#b8c1cc" : "#4e647d";
  const border = dark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.12)";
  const inputBg = dark ? "#202825" : "#fffdf9";
  const inputText = dark ? "#f3efe8" : "#111111";
  const accent = dark ? "#c7e6d2" : "#173f35";

  return `
    :root {
      --bg: ${bg};
      --bg-elev: ${elev};
      --text: ${text};
      --muted: ${muted};
      --border: ${border};
      --accent: ${accent};
      --input-bg: ${inputBg};
      --input-text: ${inputText};
    }

    html, body, #root {
      background: ${bg} !important;
      color: ${text} !important;
      min-height: 100% !important;
    }

    body {
      margin: 0 !important;
    }

    /* auth */
    .bf-auth-page,
    .bf-auth-page.is-dpg {
      background: ${dark ? bg : "#f4f1ea"} !important;
      color: ${text} !important;
    }

    .bf-auth-shell {
      background: ${dark ? elev : "#fbf8f2"} !important;
      color: ${text} !important;
      border-color: ${border} !important;
    }

    /* logged in app shell */
    .bf-page,
    .bf-main,
    .bf-shell,
    .bf-content,
    .bf-workspace,
    .bf-dashboard,
    .bf-orgShell,
    .bf-orgPage,
    main,
    section,
    article {
      background: ${dark ? bg : "transparent"} !important;
      color: ${text} !important;
    }

    /* header/nav */
    .bf-appHeader,
    .bf-appHeader.is-dpg,
    .bf-appnav,
    .bf-appnav.is-drawer {
      color: ${dark ? "#f3efe8" : ""} !important;
    }

    .bf-appnav-link {
      color: ${dark ? "#f3efe8" : ""} !important;
    }

    .bf-appnav-link.is-active {
      color: ${dark ? "#1a1714" : ""} !important;
    }

    .bf-logout,
    .bf-hamburger,
    .bf-drawer-close {
      border-color: ${border} !important;
      color: ${dark ? "#f3efe8" : ""} !important;
    }

    .bf-drawer-panel {
      background: ${dark ? "#171411" : ""} !important;
      color: ${text} !important;
    }

    /* cards / panels */
    .card,
    [class*="card"],
    [class*="panel"],
    [class*="surface"],
    [class*="sidebar"] {
      border-color: ${border} !important;
      color: ${text} !important;
    }

    /* forms */
    input,
    textarea,
    select {
      background: ${inputBg} !important;
      color: ${inputText} !important;
      border-color: ${border} !important;
    }

    a {
      color: ${dark ? "#c7e6d2" : ""} !important;
    }
  `;
}

function applyTheme(theme) {
  const root = document.documentElement;
  const body = document.body;
  const appRoot = document.getElementById("root");
  const style = ensureRuntimeStyle();

  root.setAttribute("data-theme", theme);
  body.setAttribute("data-theme", theme);

  root.classList.remove("theme-light", "theme-dark");
  body.classList.remove("theme-light", "theme-dark");
  root.classList.add(theme === "dark" ? "theme-dark" : "theme-light");
  body.classList.add(theme === "dark" ? "theme-dark" : "theme-light");

  style.textContent = buildThemeCss(theme);

  if (appRoot) {
    appRoot.style.background = theme === "dark" ? "#121715" : "#f3efe8";
    appRoot.style.color = theme === "dark" ? "#f3efe8" : "#111111";
    appRoot.style.minHeight = "100vh";
  }
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = React.useState(getInitialTheme);

  React.useEffect(() => {
    applyTheme(theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {}
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
