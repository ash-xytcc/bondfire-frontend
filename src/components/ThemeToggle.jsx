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
        border: "2px solid var(--border)",
        borderRadius: 999,
        padding: "10px 14px",
        background: theme === "dark" ? "#1a211e" : "#faf7f2",
        color: theme === "dark" ? "#f3efe8" : "#111111",
        cursor: "pointer",
        fontWeight: 700,
        boxShadow: "0 6px 20px rgba(0,0,0,0.18)",
      }}
    >
      {theme === "dark" ? "light mode" : "dark mode"}
    </button>
  );
}
