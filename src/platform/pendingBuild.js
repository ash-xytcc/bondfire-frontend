const PENDING_BUILD_KEY = "bf_pending_module_build_v1";

export function readPendingBuild() {
  try {
    const parsed = JSON.parse(localStorage.getItem(PENDING_BUILD_KEY) || "[]");
    return Array.isArray(parsed)
      ? parsed.map((id) => String(id || "").trim()).filter(Boolean)
      : [];
  } catch {
    return [];
  }
}

export function writePendingBuild(ids) {
  try {
    const safe = Array.from(
      new Set((Array.isArray(ids) ? ids : []).map((id) => String(id || "").trim()).filter(Boolean))
    );
    localStorage.setItem(PENDING_BUILD_KEY, JSON.stringify(safe));
  } catch {}
}

export function clearPendingBuild() {
  try {
    localStorage.removeItem(PENDING_BUILD_KEY);
  } catch {}
}
