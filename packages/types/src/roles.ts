// packages/types/src/roles.ts

export const METRIC_ROLES = [
	'G', // Grid column
	'I', // Inspector field
	'R', // Right sidebar tab content
	'L', // Left sidebar facet / filter
	'H', // Header KPI tile
	'B', // Bottom bar status
	'V', // View canvas (chart, map, graph)
	'X', // Export column
	'K', // Key identifier (URL, id, hash)
	'A', // Action driver (input to action engine)
	'S', // Score component
	'T', // Time-series / compare
	'E', // Event / alert source
] as const;

export type MetricRole = typeof METRIC_ROLES[number];

export const ROLE_LABEL: Record<MetricRole, string> = {
	G: 'Grid column', I: 'Inspector', R: 'Right sidebar', L: 'Left sidebar',
	H: 'Header KPI', B: 'Bottom bar',  V: 'View canvas',   X: 'Export',
	K: 'Identifier', A: 'Action driver', S: 'Score input', T: 'Compare',
	E: 'Event',
};

export function hasRole(roles: ReadonlyArray<MetricRole>, role: MetricRole): boolean {
	return roles.includes(role);
}
