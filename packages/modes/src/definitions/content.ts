import { defineMode } from './shared';

export function registerContentMode() {
  defineMode({
    id: 'content',
    description: 'Content quality, intent, and freshness.',
    shortcut: '4',
    visible: ['p.identity.url', 'p.content.wordCount', 'p.content.category', 'p.search.intent'],
  });
}
