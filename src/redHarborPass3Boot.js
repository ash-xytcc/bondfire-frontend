function applyRedHarborPass3Flags() {
  if (typeof document === "undefined") return;

  const path = window.location.pathname || "";
  const hash = window.location.hash || "";
  const href = `${path}${hash}`.toLowerCase();

  const body = document.body;
  if (!body) return;

  body.classList.remove("rh-pass3-app", "rh-pass3-bulletin-public", "rh-pass3-bulletin-editor");

  const inApp = path.startsWith("/app");
  const isPublicBulletin = path === "/bulletin" || path.startsWith("/bulletin/");
  const isEditor = inApp && href.includes("bulletin");

  if (inApp) body.classList.add("rh-pass3-app");
  if (isPublicBulletin) body.classList.add("rh-pass3-bulletin-public");
  if (isEditor) body.classList.add("rh-pass3-bulletin-editor");
}

applyRedHarborPass3Flags();
window.addEventListener("hashchange", applyRedHarborPass3Flags);
window.addEventListener("popstate", applyRedHarborPass3Flags);
document.addEventListener("DOMContentLoaded", applyRedHarborPass3Flags);
