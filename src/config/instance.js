export const INSTANCE = {
  id: "dpg",
  name: "Dual Power West",
  shortName: "DPG",
  tagline: "Mutual aid, coordination, and event operations",
  publicBasePath: "/",
  adminBasePath: "/app",
  features: {
    publicHome: true,
    adminOps: true,
    publicInbox: true,
    volunteers: true,
    meetings: true,
    inventory: true,
    rsvpImportLater: true,
  },
};

export function siteTitle(pageTitle = "") {
  return pageTitle ? `${pageTitle} | ${INSTANCE.name}` : INSTANCE.name;
}
