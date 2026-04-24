/**
 * Platform-owned module registry.
 *
 * These modules are intentionally dormant by default. They provide a stable,
 * additive declaration surface for future phased rollouts.
 */
export const platformModuleRegistry = [
	{
		id: "org-ops-lab",
		label: "Operations Lab",
		featureFlag: "platform.org_ops_lab",
		routeBase: "ops",
		enabledByDefault: false,
		getRoutes: () => [
			{
				path: "ops",
				kind: "placeholder",
				moduleId: "org-ops-lab",
			},
		],
	},
	{
		id: "org-automation-lab",
		label: "Automation Lab",
		featureFlag: "platform.org_automation_lab",
		routeBase: "automation",
		enabledByDefault: false,
		getRoutes: () => [
			{
				path: "automation",
				kind: "placeholder",
				moduleId: "org-automation-lab",
			},
		],
	},
];

export function getPlatformModules() {
	return [...platformModuleRegistry];
}
