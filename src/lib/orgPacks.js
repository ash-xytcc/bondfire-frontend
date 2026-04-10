const ORG_PACKS_KEY = "bf_org_pack_";
const ORG_SETTINGS_KEY = "bf_org_settings_";

export const STARTER_PACKS = [
  {
    id: "general",
    label: "General Org",
    description: "Default Bondfire layout.",
    modules: ["overview", "people", "inventory", "needs", "meetings", "drive", "studio", "settings", "chat"],
  },
  {
    id: "mutual-aid",
    label: "Mutual Aid / DPG",
    description: "People, inventory, needs, meetings, drive, settings.",
    modules: ["overview", "people", "inventory", "needs", "meetings", "drive", "settings"],
  },
  {
    id: "union-branch",
    label: "Union Branch / Red Harbor",
    description: "People, meetings, drive, settings, with public union-facing defaults. No chat.",
    modules: ["overview", "people", "meetings", "drive", "settings", "public"],
    publicConfig: {
      enabled: true,
      newsletter_enabled: true,
      pledges_enabled: false,
      show_action_strip: true,
      show_needs: false,
      show_meetings: true,
      show_what_we_do: true,
      show_get_involved: true,
      show_newsletter_card: true,
      show_website_button: false,
      title: "IWW Red Harbor",
      location: "Grays Harbor, Washington",
      about:
        "A small but growing industrial union branch rooted on the harbor. We are building a practical local union presence for workers, neighbors, and anyone who wants to organize seriously.",
      accent_color: "#b22222",
      theme_mode: "dark",
      website_link: null,
      meeting_rsvp_url: "",
      what_we_do: [
        "Worker outreach and organizing support",
        "Local meetings and political education",
        "Public events and union visibility",
        "Resource sharing for new and prospective members",
      ],
      primary_actions: [
        { label: "Get Involved", url: "modal:intake" },
        { label: "Sign Up for Updates", url: "newsletter" },
        { label: "View Meetings", url: "#meetings" },
      ],
      get_involved_links: [
        { label: "Join the Branch", url: "modal:intake" },
        { label: "Organize Your Workplace", url: "modal:intake" },
        { label: "Contact Us", url: "mailto:redharbor@iww.org" },
      ],
      slug: "red-harbor",
    },
  },
];

export function getPackById(packId) {
  return STARTER_PACKS.find((p) => p.id === packId) || STARTER_PACKS[0];
}

export function getOrgPackId(orgId) {
  try {
    return localStorage.getItem(`${ORG_PACKS_KEY}${orgId}`) || "general";
  } catch {
    return "general";
  }
}

export function setOrgPackId(orgId, packId) {
  try {
    localStorage.setItem(`${ORG_PACKS_KEY}${orgId}`, packId);
  } catch {}
}

export function getOrgModules(orgId) {
  const pack = getPackById(getOrgPackId(orgId));
  return Array.isArray(pack?.modules) ? pack.modules : STARTER_PACKS[0].modules;
}

function readCookie(name) {
  if (typeof document === "undefined") return "";
  const safe = name.replace(/[$()*+.?[\\\]^{|}]/g, "\\$&");
  const m = document.cookie.match(new RegExp(`(?:^|; )${safe}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : "";
}

function getToken() {
  try {
    return localStorage.getItem("bf_auth_token") || sessionStorage.getItem("bf_auth_token") || "";
  } catch {
    return "";
  }
}

function mergeOrgSettings(orgId, patch) {
  try {
    const key = `${ORG_SETTINGS_KEY}${orgId}`;
    const prev = JSON.parse(localStorage.getItem(key) || "{}");
    const next = { ...prev, ...patch };
    localStorage.setItem(key, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("bf:org_settings_changed", { detail: { orgId } }));
  } catch {}
}

async function savePublicConfig(orgId, config) {
  const token = getToken();
  const csrf = readCookie("bf_csrf");
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (csrf) headers["X-CSRF"] = csrf;

  const res = await fetch(`/api/orgs/${encodeURIComponent(orgId)}/public/save`, {
    method: "POST",
    credentials: "include",
    headers,
    body: JSON.stringify(config),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.ok === false) {
    throw new Error(data?.error || data?.message || `HTTP ${res.status}`);
  }

  try {
    localStorage.setItem(`bf_public_cfg_${orgId}`, JSON.stringify(config));
  } catch {}

  return data;
}

export async function applyOrgPack(org, packId) {
  const orgId = org?.id;
  if (!orgId) return;

  const pack = getPackById(packId);
  setOrgPackId(orgId, pack.id);

  mergeOrgSettings(orgId, {
    enabledModules: pack.modules,
    starterPack: pack.id,
    name: org?.name || "",
  });

  if (pack.publicConfig) {
    await savePublicConfig(orgId, {
      ...pack.publicConfig,
      title: org?.name || pack.publicConfig.title,
    });
  }
}
