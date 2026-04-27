import { defineMode } from './shared';

export function registerPaidMode() {
  defineMode({
    id: 'paid',
    description: 'Paid media and landing efficiency surfaces.',
    shortcut: '7',
    visible: ['p.identity.url', 'p.search.mainKw', 'p.actions.estimatedImpact', 'p.actions.priority'],
  });
}
