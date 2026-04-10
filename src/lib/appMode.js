export function getAppMode() {
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get("app") || "bondfire";
  } catch {
    return "bondfire";
  }
}

export function isRedHarborMode() {
  return getAppMode() === "red-harbor";
}
