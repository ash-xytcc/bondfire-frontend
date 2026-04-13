import React from "react";
import { useTheme } from "../theme.jsx";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [tick, setTick] = React.useState(0);

  React.useEffect(() => {
    const id = setInterval(() => setTick((x) => x + 1), 500);
    return () => clearInterval(id);
  }, []);

  const dbg = window.__BF_THEME_DEBUG__ || {};
  const rootBg = dbg.rootBg || "n/a";
  const bodyBg = dbg.bodyBg || "n/a";

  return (
    <div
      style={{
        position: "fixed",
        right: 16,
        bottom: 16,
        zIndex: 9999,
        display: "grid",
        gap: 8,
        minWidth: 220,
      }}
    >
      <button
        type="button"
        onClick={toggleTheme}
        style={{
          border: "2px solid #000",
          borderRadius: 999,
          padding: "10px 14px",
          background: theme === "dark" ? "#1a211e" : "#faf7f2",
          color: theme === "dark" ? "#f3efe8" : "#111111",
          cursor: "pointer",
          fontWeight: 700,
        }}
      >
        toggle theme: {theme}
      </button>

      <div
        style={{
          background: "#111",
          color: "#0f0",
          borderRadius: 12,
          padding: 10,
          fontSize: 12,
          lineHeight: 1.4,
          fontFamily: "monospace",
          boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
        }}
      >
        <div>theme: {String(theme)}</div>
        <div>rootBg: {String(rootBg)}</div>
        <div>bodyBg: {String(bodyBg)}</div>
        <div>tick: {tick}</div>
      </div>
    </div>
  );
}
