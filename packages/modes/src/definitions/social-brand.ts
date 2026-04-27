import { defineMode } from './shared';

export function registerSocialBrandMode() {
  defineMode({
    id: 'socialBrand',
    description: 'Brand and social visibility signals.',
    shortcut: '9',
    visible: ['p.identity.url', 'p.content.category', 'p.actions.primary'],
  });
}
