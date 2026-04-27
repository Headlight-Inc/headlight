import { defineMode } from './shared';

export function registerTechnicalMode() {
  defineMode({
    id: 'technical',
    description: 'Crawlability, indexing, protocol, and performance.',
    shortcut: '3',
    visible: ['p.identity.url', 'p.tech.statusCode', 'p.tech.cwv.bucket', 'p.indexing.status'],
  });
}
