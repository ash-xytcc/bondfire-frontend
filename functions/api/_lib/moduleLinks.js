export function normalizeLinkedItem(input) {
  if (!input || typeof input !== "object") return null;

  const type = String(input.type || "").trim();
  const id = String(input.id || "").trim();
  const label = String(input.label || "").trim();
  const href = String(input.href || "").trim();

  if (!type && !id && !label && !href) return null;

  return {
    type: type || "record",
    id: id || "",
    label: label || id || href || "Linked item",
    href: href || "",
  };
}

export function serializeLinkedItem(input) {
  const linked = normalizeLinkedItem(input);
  return linked ? JSON.stringify(linked) : null;
}

export function parseLinkedItem(raw) {
  if (!raw) return null;
  if (typeof raw === "object") return normalizeLinkedItem(raw);
  try {
    return normalizeLinkedItem(JSON.parse(String(raw)));
  } catch {
    return null;
  }
}
