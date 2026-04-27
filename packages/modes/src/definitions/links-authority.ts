import { defineMode } from './shared';

export function registerLinksAuthorityMode() {
  defineMode({
    id: 'linksAuthority',
    description: 'Authority, backlink, and internal link signals.',
    shortcut: '5',
    visible: ['p.identity.url', 'p.links.backlinks', 'p.links.inlinks', 'p.links.internalPageRank'],
  });
}
