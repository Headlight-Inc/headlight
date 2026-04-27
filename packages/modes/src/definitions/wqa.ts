import { defineMode } from './shared';

export function registerWqaMode() {
  defineMode({
    id: 'wqa',
    description: 'Universal web quality with per-industry overlays.',
    shortcut: '2',
    visible: ['p.identity.url', 'p.score.health', 'p.search.gsc.clicks', 'p.links.score'],
  });
}
