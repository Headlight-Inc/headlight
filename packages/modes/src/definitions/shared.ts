import type { Mode } from '../../../types/src';
import { MODE_ACCENT, MODE_LABEL } from '../../../types/src';
import { registerMode, registerModeColumnDefaults, type ModeDescriptor } from '../registry';

const REGISTERED = new Set<Mode>();

export function defineMode(input: {
  id: Mode;
  description: string;
  shortcut: string;
  defaultViewId?: string;
  views?: ModeDescriptor['views'];
  lsSections?: ModeDescriptor['lsSections'];
  rsTabs?: ModeDescriptor['rsTabs'];
  visible: string[];
}) {
  if (REGISTERED.has(input.id)) return;
  registerMode({
    id: input.id,
    label: MODE_LABEL[input.id],
    accent: MODE_ACCENT[input.id],
    description: input.description,
    shortcut: input.shortcut,
    defaultViewId: input.defaultViewId ?? 'table',
    views: input.views ?? [{ id: 'table', kind: 'table', label: 'Table' }],
    lsSections: input.lsSections ?? [
      { id: 'filters', label: 'Filters', type: 'facet' },
      { id: 'saved', label: 'Saved Views', type: 'saved-views' },
    ],
    rsTabs: input.rsTabs ?? [
      { id: 'summary', label: 'Summary' },
      { id: 'actions', label: 'Actions' },
    ],
  });
  registerModeColumnDefaults(input.id, { visible: input.visible });
  REGISTERED.add(input.id);
}
