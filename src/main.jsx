if (typeof window !== "undefined" && !window.__BF_HEADERS_TRAP__) {
  window.__BF_HEADERS_TRAP__ = true;

  const originalError = console.error;
  console.error = function (...args) {
    try {
      const text = args.map((x) => {
        try { return typeof x === "string" ? x : JSON.stringify(x); }
        catch { return String(x); }
      }).join(" ");
      if (text.includes("reading 'headers'") || text.includes('reading "headers"')) {
        originalError.call(console, "BF_HEADERS_TRAP stack:", new Error("headers trap").stack);
      }
    } catch {}
    return originalError.apply(console, args);
  };

  window.addEventListener("error", (event) => {
    try {
      const msg = String(event?.message || "");
      if (msg.includes("reading 'headers'") || msg.includes('reading "headers"')) {
        console.error("BF_HEADERS_TRAP event", event?.error?.stack || event);
      }
    } catch {}
  });
}

import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import "./debug/initDebug.js";

// Temporary hard reset of stale PWA/service-worker state.
// The current repo is configured to keep SW updates until the next reload,
// which can leave you testing an older cached bundle while replacing Studio.jsx.
try {
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    window.addEventListener("load", async () => {
      try {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((reg) => reg.unregister().catch(() => false)));
      } catch {}
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key).catch(() => false)));
      } catch {}
    });
  }
} catch {}

try {
  const stamp = new Date().toISOString();
  console.log("BONDFIRE build:", stamp);
  window.__BF_BUILD = stamp;
} catch {}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
