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
  wqa: 'Web Quality',
  technical: 'Technical',
  content: 'Content',
  linksAuthority: 'Links & Authority',
  uxConversion: 'UX & Conversion',
  paid: 'Paid',
  commerce: 'E-commerce',
  socialBrand: 'Social & Brand',
  ai: 'AI',
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
