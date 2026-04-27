import { defineMode } from './shared';

export function registerCompetitorsMode() {
  defineMode({
    id: 'competitors',
    description: 'Competitive comparisons and gaps.',
    shortcut: 'C',
    visible: ['p.identity.url', 'p.search.gsc.clicks', 'p.search.gsc.impressions', 'p.search.mainKwPosition'],
  });
}
