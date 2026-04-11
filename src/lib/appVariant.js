export const APP_VARIANT_KEY = "bf_app_variant";

function safeUrl() {
  try {
    return new URL(window.location.href);
  } catch {
    return null;
  }
}

export function getAppVariant() {
  if (typeof window === "undefined") return "bondfire";

  try {
    const host = String(window.location.hostname || "").toLowerCase();
    if (host === "dualpowerwest.org" || host === "www.dualpowerwest.org") {
      localStorage.setItem(APP_VARIANT_KEY, "dpg");
      return "dpg";
    }
  } catch {}

  try {
    const url = safeUrl();
    const qp = url?.searchParams?.get("app");
    if (qp === "dpg") {
      localStorage.setItem(APP_VARIANT_KEY, "dpg");
      return "dpg";
    }
    if (qp === "bondfire") {
      localStorage.setItem(APP_VARIANT_KEY, "bondfire");
      return "bondfire";
    }
  } catch {}

  try {
    const saved = localStorage.getItem(APP_VARIANT_KEY);
    if (saved === "dpg" || saved === "bondfire") return saved;
  } catch {}

  return "bondfire";
}

export function isDpgVariant() {
  try {
    const h = window.location.hash || "";
    const p = window.location.pathname || "";

    // support BOTH legacy ?app=dpg AND new real routes
    if (h.includes("/dpg/") || h.includes("/org/dpg/")) return true;
    if (p.includes("/dpg/") || p.includes("/org/dpg/")) return true;

    // legacy support
    const params = new URLSearchParams(window.location.search);
    if (params.get("app") === "dpg") return true;

    return false;
  } catch {
    return false;
  }
}

export function applyAppVariantToDocument() {
  if (typeof document === "undefined") return;
  const variant = getAppVariant();
  document.body.setAttribute("data-app-variant", variant);
  document.documentElement.setAttribute("data-app-variant", variant);
  document.title = variant === "dpg" ? "Dual Power West" : "Bondfire";
}

export function getAppBrand() {
  const dpg = isDpgVariant();
  return dpg
    ? {
        name: "Dual Power West",
        shortName: "DPW",
        publicSiteTitle: "Dual Power West",
        homeHref: "/admin/#/orgs",
        adminLabel: "Dual Power West admin",
        adminSignInHref: "/admin/#/signin",
        footerLabel: "Powered by Bondfire",
        logoSrc: "/branding/dpg-logo.png",
        logoAlt: "Dual Power West",
        colors: {
          green: "#385032",
          blue: "#5f94dd",
          blueDark: "#4f7fc0",
          mist: "#dbe6f5",
          paper: "#f4f2eb",
        },
      }
    : {
        name: "Bondfire",
        shortName: "Bondfire",
        publicSiteTitle: "Bondfire",
        homeHref: "/orgs",
        adminLabel: "Bondfire admin",
        adminSignInHref: "/#/signin",
        footerLabel: "",
        logoSrc: "/logo-bondfire.png",
        logoAlt: "Bondfire logo",
        colors: {
          green: "#b3261e",
          blue: "#b3261e",
          blueDark: "#8b1f18",
          mist: "#f5f5f5",
          paper: "#111111",
        },
      };
}

export function getBranding() {
  return getAppBrand();
}


export function getAdminBasePath() {
  return "";
}
