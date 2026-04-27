import { defineMode } from './shared';

export function registerAiMode() {
  defineMode({
    id: 'ai',
    description: 'AI readiness and discoverability.',
    shortcut: 'A',
    visible: ['p.identity.url', 'p.content.wordCount', 'p.search.intentMatch', 'p.actions.primary'],
  });
}
