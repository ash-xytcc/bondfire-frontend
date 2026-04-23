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
  const normalized = normalizeLinkedItem(input);
  return normalized ? JSON.stringify(normalized) : null;
}

export function parseLinkedItem(value) {
  if (!value) return null;
  if (typeof value === "object") return normalizeLinkedItem(value);

  try {
    return normalizeLinkedItem(JSON.parse(String(value)));
  } catch {
    return null;
  }
}

export function linkedItemDisplayText(item) {
  const linked = normalizeLinkedItem(item);
  if (!linked) return "";
  if (linked.id) return `${linked.label} (${linked.type}:${linked.id})`;
  return linked.label;
}
