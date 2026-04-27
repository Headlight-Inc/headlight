// packages/types/src/modes.ts

export const MODES = [
	'fullAudit',
	'wqa',
	'technical',
	'content',
	'linksAuthority',
	'uxConversion',
	'paid',
	'commerce',
	'socialBrand',
	'ai',
	'competitors',
	'local',
] as const;

export type Mode = typeof MODES[number];

export const MODE_LABEL: Record<Mode, string> = {
	fullAudit: 'Full Audit',
	wqa: 'Website Quality',
	technical: 'Technical',
	content: 'Content',
	linksAuthority: 'Links & Authority',
	uxConversion: 'UX & Conversion',
	paid: 'Paid',
	commerce: 'Commerce',
	socialBrand: 'Social & Brand',
	ai: 'AI & Answer Engines',
	competitors: 'Competitors',
	local: 'Local',
};

export const MODE_ACCENT: Record<Mode, string> = {
	fullAudit: 'slate',
	wqa: 'violet',
	technical: 'blue',
	content: 'amber',
	linksAuthority: 'teal',
	uxConversion: 'rose',
	paid: 'cyan',
	commerce: 'green',
	socialBrand: 'indigo',
	ai: 'fuchsia',
	competitors: 'red',
	local: 'orange',
};

export const MODE_SHORTCUT: Record<Mode, string> = {
	fullAudit: '1', wqa: '2', technical: '3', content: '4',
	linksAuthority: '5', uxConversion: '6', paid: '7', commerce: '8',
	socialBrand: '9', ai: 'A', competitors: 'C', local: 'L',
};

export function isMode(value: unknown): value is Mode {
	return typeof value === 'string' && (MODES as readonly string[]).includes(value);
}

// ─── Legacy-compat aliases ───
export type AuditMode = Mode;
export const CANONICAL_AUDIT_MODES = MODES;
