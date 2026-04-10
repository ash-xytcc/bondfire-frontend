export function getAppMode() {
  try {
    const url = new URL(window.location.href);
    const searchMode = url.searchParams.get("app");
    if (searchMode) return searchMode;

    const hash = window.location.hash || "";
    if (
      hash.startsWith("#/red-harbor") ||
      hash.startsWith("#/p/red-harbor")
    ) {
      return "red-harbor";
    }

    return "bondfire";
  } catch {
    return "bondfire";
  }
}

export function isRedHarborMode() {
  return getAppMode() === "red-harbor";
}
