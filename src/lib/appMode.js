const RED_HARBOR_HOSTS = new Set([
  "redharbor.org",
  "www.redharbor.org",
]);

export function getAppMode() {
  try {
    const url = new URL(window.location.href);
    const host = String(url.hostname || "").trim().toLowerCase();
    const raw = String(url.searchParams.get("app") || "").trim().toLowerCase();
    const hash = window.location.hash || "";

    // 1) Real domain wins automatically
    if (RED_HARBOR_HOSTS.has(host)) return "red-harbor";

    // 2) Query param aliases still supported
    if (raw === "red-harbor" || raw === "redharbor") return "red-harbor";
    if (raw) return raw;

    // 3) Hash-route fallback for preview/dev
    if (
      hash.startsWith("#/red-harbor") ||
      hash.startsWith("#/signin") ||
      hash.startsWith("#/orgs") ||
      hash.startsWith("#/org/")
    ) {
      return "red-harbor";
    }

    // 4) Default on this branch
    return "red-harbor";
  } catch {
    return "red-harbor";
  }
}

export function isRedHarborMode() {
  return getAppMode() === "red-harbor";
}
