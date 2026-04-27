import { defineMode } from './shared';

export function registerLocalMode() {
  defineMode({
    id: 'local',
    description: 'Local relevance, entity, and conversion coverage.',
    shortcut: 'L',
    visible: ['p.identity.url', 's.local.napConsistent', 's.local.hasLocalSchema', 's.local.hasGmbLink'],
  });
}
