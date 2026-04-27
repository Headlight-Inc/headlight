import { defineMode } from './shared';

export function registerCommerceMode() {
  defineMode({
    id: 'commerce',
    description: 'Catalog, product, and revenue-critical signals.',
    shortcut: '8',
    visible: ['p.identity.url', 'p.commerce.feed.errors', 's.commerce.productSchemaCoverage', 's.commerce.reviewSchemaCoverage'],
  });
}
