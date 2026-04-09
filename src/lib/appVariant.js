const DPG_HOSTS = new Set([
  "dualpowerwest.org",
  "www.dualpowerwest.org",
]);

const STORAGE_KEY = "bf_app_variant";

function readQueryVariant() {
  try {
    const qs = new URLSearchParams(window.location.search);
    return String(qs.get("app") || "").trim().toLowerCase();
  } catch {
    return "";
  }
}

function readStoredVariant() {
  try {
    return String(window.localStorage.getItem(STORAGE_KEY) || "").trim().toLowerCase();
  } catch {
    return "";
  }
}

function persistVariant(variant) {
  try {
    if (variant === "dpg" || variant === "bondfire") {
      window.localStorage.setItem(STORAGE_KEY, variant);
    }
  } catch {
    // ignore storage failures
  }
}

export function getAppVariant() {
  const envVariant = String(import.meta.env.VITE_APP_VARIANT || "").trim().toLowerCase();
  const queryVariant = typeof window !== "undefined" ? readQueryVariant() : "";
  const host = typeof window !== "undefined" ? String(window.location.hostname || "").toLowerCase() : "";
  const storedVariant = typeof window !== "undefined" ? readStoredVariant() : "";

  if (queryVariant === "dpg" || queryVariant === "bondfire") {
    persistVariant(queryVariant);
    return queryVariant;
  }
  if (envVariant === "dpg" || envVariant === "bondfire") {
    persistVariant(envVariant);
    return envVariant;
  }
  if (DPG_HOSTS.has(host)) {
    persistVariant("dpg");
    return "dpg";
  }
  if (storedVariant === "dpg" || storedVariant === "bondfire") return storedVariant;
  return "bondfire";
}

export function isDpgVariant() {
  return getAppVariant() === "dpg";
}

export function getAdminBasePath() {
  return "";
}

export function getBranding() {
  if (isDpgVariant()) {
    return {
      key: "dpg",
      appName: "Dual Power West",
      shortName: "DPG",
      publicSiteTitle: "Dual Power West",
      publicSiteTagline: "A yearly gathering for shared power, skill, strategy, and on-the-ground imagination.",
      adminBasePath: "/admin",
      adminSignInHref: "/admin/#/signin",
      homeHref: "/orgs",
      logoSrc: "/logo-bondfire.png",
      poweredByBondfire: true,
    };
  }

  return {
    key: "bondfire",
    appName: "Bondfire",
    shortName: "Bondfire",
    publicSiteTitle: "Bondfire",
    publicSiteTagline: "Mutual aid ops in one place.",
    adminBasePath: "",
    adminSignInHref: "/#/signin",
    homeHref: "/orgs",
    logoSrc: "/logo-bondfire.png",
    poweredByBondfire: false,
  };
}
