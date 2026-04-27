import { defineMode } from './shared';

export function registerUxConversionMode() {
  defineMode({
    id: 'uxConversion',
    description: 'Behavior and conversion-focused metrics.',
    shortcut: '6',
    visible: ['p.identity.url', 'p.traffic.ga4.sessions', 'p.traffic.ga4.conversionRate', 'p.actions.primary'],
  });
}
