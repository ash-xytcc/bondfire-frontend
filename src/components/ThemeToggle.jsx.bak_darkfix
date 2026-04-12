import React from "react";
import { useTheme } from "../theme.jsx";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      title="Toggle dark mode"
      style={{
        position: "fixed",
        right: 16,
        bottom: 16,
        zIndex: 9999,
        border: "1px solid var(--border)",
        borderRadius: 999,
        padding: "10px 14px",
        background: "var(--bg-elev)",
        color: "var(--text)",
        cursor: "pointer",
        fontWeight: 700,
        boxShadow: "0 6px 20px rgba(0,0,0,0.18)",
      }}
    >
      {theme === "dark" ? "light mode" : "dark mode"}
    </button>
  );
}
