import React from "react";
import { useTheme } from "../theme";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      style={{
        border: "1px solid var(--border)",
        borderRadius: 999,
        padding: "10px 14px",
        background: "var(--bg-elev)",
        color: "var(--text)",
        cursor: "pointer",
        fontWeight: 700,
      }}
      aria-label="Toggle dark mode"
      title="Toggle dark mode"
    >
      {theme === "dark" ? "light mode" : "dark mode"}
    </button>
  );
}
