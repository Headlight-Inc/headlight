import { defineMode } from './shared';

export function registerFullAuditMode() {
  defineMode({
    id: 'fullAudit',
    description: 'All checks and all major surfaces.',
    shortcut: '1',
    visible: ['p.identity.url', 'p.tech.statusCode', 'p.content.category', 'p.search.gsc.clicks'],
  });
}
