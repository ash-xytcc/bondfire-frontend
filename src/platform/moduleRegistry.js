/**
 * Bondfire V3 module registry.
 *
 * The registry is the shared vocabulary for the builder, navigation, and
 * future phased rollouts. Core modules are available now; on-deck modules
 * stay visible as honest placeholders until their routes are ready.
 */

const LIVE_MODULES = [
  {
    id: "people",
    label: "People",
    name: "People + roles",
    mark: "PE",
    description: "Keep the human map close: members, roles, skills, and the people who make the work possible.",
    routeBase: "people",
    tier: "live",
    available: true,
    defaultEnabled: true,
  },
  {
    id: "needs",
    label: "Needs",
    name: "Needs board",
    mark: "ND",
    description: "Turn requests into visible work without losing the context, care, or follow-through around them.",
    routeBase: "needs",
    tier: "live",
    available: true,
    defaultEnabled: true,
  },
  {
    id: "inventory",
    label: "Inventory",
    name: "Shared inventory",
    mark: "IN",
    description: "Know what is on hand, what is moving, and what the collective can share right now.",
    routeBase: "inventory",
    tier: "live",
    available: true,
    defaultEnabled: true,
  },
  {
    id: "meetings",
    label: "Meetings",
    name: "Meeting notes + rhythm",
    mark: "MT",
    description: "Give decisions a home and let the group keep its own cadence instead of chasing productivity theater.",
    routeBase: "meetings",
    tier: "live",
    available: true,
    defaultEnabled: true,
  },
  {
    id: "events",
    label: "Events",
    name: "Events",
    mark: "EV",
    description: "Coordinate public moments, gatherings, and the details that make showing up possible.",
    routeBase: "events",
    tier: "live",
    available: true,
    defaultEnabled: true,
  },
  {
    id: "witness-archive",
    label: "Witness",
    name: "Witness archive",
    mark: "WI",
    description: "Hold memory with intention: what happened, what mattered, and what should not be erased.",
    routeBase: "witness",
    tier: "live",
    available: true,
    defaultEnabled: true,
  },
  {
    id: "drive",
    label: "Drive",
    name: "Shared drive",
    mark: "DR",
    description: "Keep working documents, notes, templates, and files somewhere the whole crew can find them.",
    routeBase: "drive",
    tier: "live",
    available: true,
    defaultEnabled: true,
  },
  {
    id: "studio",
    label: "Studio",
    name: "Studio",
    mark: "ST",
    description: "Make the public-facing pieces without handing the voice of the work to a growth funnel.",
    routeBase: "studio",
    tier: "live",
    available: true,
    defaultEnabled: true,
  },
  {
    id: "public-site",
    label: "Public site",
    name: "Public page",
    mark: "PB",
    description: "Choose what the outside world can see, find, and act on while the private room stays private.",
    routeBase: "public",
    tier: "live",
    available: true,
    defaultEnabled: true,
  },
  {
    id: "bondfire-chat",
    label: "Chat",
    name: "Bondfire chat",
    mark: "CH",
    description: "Keep the quick talk close to the work, with a room that belongs to the organization.",
    routeBase: "chat",
    tier: "live",
    available: true,
    defaultEnabled: true,
  },
  {
    id: "module-chat",
    label: "Module chat",
    name: "Module chat",
    mark: "MC",
    description: "A focused conversation surface for teams that want a dedicated module room.",
    routeBase: "chat-module",
    tier: "live",
    available: true,
    defaultEnabled: true,
  },
];

const ON_DECK_MODULES = [
  {
    id: "mutual-aid",
    label: "Mutual aid",
    name: "Mutual aid board",
    mark: "MA",
    description: "Match needs, offers, and practical support without turning solidarity into a marketplace.",
    tier: "on-deck",
    available: false,
    defaultEnabled: false,
    status: "planned",
  },
  {
    id: "feedback",
    label: "Feedback",
    name: "Feedback loops",
    mark: "FB",
    description: "Make room for reflection, consent, and repair as part of the work itself.",
    tier: "on-deck",
    available: false,
    defaultEnabled: false,
    status: "planned",
  },
  {
    id: "campaign-coordination",
    label: "Campaigns",
    name: "Campaign coordination",
    mark: "CA",
    description: "Bring a campaign from intention to action with shared tasks, signals, and accountability.",
    tier: "on-deck",
    available: false,
    defaultEnabled: false,
    status: "planned",
  },
  {
    id: "publishing-colophon",
    label: "Colophon",
    name: "Publishing + colophon",
    mark: "CO",
    description: "Publish the work with its sources, conditions, and people named instead of flattened away.",
    tier: "on-deck",
    available: false,
    defaultEnabled: false,
    status: "planned",
  },
  {
    id: "org-ops-lab",
    label: "Operations Lab",
    name: "Operations Lab",
    mark: "OP",
    description: "A future space for deeper operational views and collective infrastructure experiments.",
    featureFlag: "platform.org_ops_lab",
    routeBase: "ops",
    tier: "on-deck",
    available: false,
    defaultEnabled: false,
    status: "planned",
    getRoutes: () => [
      { path: "ops", kind: "placeholder", moduleId: "org-ops-lab" },
    ],
  },
  {
    id: "org-automation-lab",
    label: "Automation Lab",
    name: "Automation Lab",
    mark: "AU",
    description: "A future space for carefully bounded automations that serve the group instead of surveilling it.",
    featureFlag: "platform.org_automation_lab",
    routeBase: "automation",
    tier: "on-deck",
    available: false,
    defaultEnabled: false,
    status: "planned",
    getRoutes: () => [
      { path: "automation", kind: "placeholder", moduleId: "org-automation-lab" },
    ],
  },
];

export const platformModuleRegistry = [...LIVE_MODULES, ...ON_DECK_MODULES];

export const DEFAULT_ENABLED_MODULE_IDS = Object.freeze(
  LIVE_MODULES.filter((moduleDef) => moduleDef.defaultEnabled).map((moduleDef) => moduleDef.id)
);

export const STARTER_PACKS = Object.freeze([
  {
    id: "full-house",
    label: "Full house",
    description: "Every live module, ready to go.",
    modules: DEFAULT_ENABLED_MODULE_IDS,
  },
  {
    id: "organizing",
    label: "Organizing cell",
    description: "People, rhythm, needs, events, and the shared room.",
    modules: ["people", "meetings", "needs", "events", "bondfire-chat", "witness-archive", "drive"],
  },
  {
    id: "community",
    label: "Community desk",
    description: "The public front door plus the practical basics.",
    modules: ["people", "needs", "events", "bondfire-chat", "public-site"],
  },
  {
    id: "story",
    label: "Story room",
    description: "Memory, making, publishing, and the room behind it.",
    modules: ["witness-archive", "studio", "drive", "public-site", "bondfire-chat"],
  },
]);

export function getPlatformModules() {
  return platformModuleRegistry.map((moduleDef) => ({ ...moduleDef }));
}

export function getAvailablePlatformModules() {
  return getPlatformModules().filter((moduleDef) => moduleDef.available);
}

export function getModuleById(id) {
  const wanted = String(id || "").trim();
  return getPlatformModules().find((moduleDef) => moduleDef.id === wanted) || null;
}

export function getDefaultEnabledModuleIds() {
  return [...DEFAULT_ENABLED_MODULE_IDS];
}

export function getStarterPacks() {
  return STARTER_PACKS.map((pack) => ({ ...pack, modules: [...pack.modules] }));
}

export function normalizeSelectedModuleIds(value) {
  const requested = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(",")
      : [];
  const wanted = new Set(requested.map((id) => String(id || "").trim()).filter(Boolean));
  return getAvailablePlatformModules()
    .filter((moduleDef) => wanted.has(moduleDef.id))
    .map((moduleDef) => moduleDef.id);
}
