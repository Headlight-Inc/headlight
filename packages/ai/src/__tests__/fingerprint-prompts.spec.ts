import { beforeAll, describe, expect, it } from 'vitest';
import { promptRegistry } from '../registry';
import { registerFingerprintPrompts } from '../prompts';

beforeAll(() => registerFingerprintPrompts());

describe('fingerprint prompts', () => {
  it('registers all prompt ids', () => {
    expect(promptRegistry.get('fingerprint.industry.classify')).toBeDefined();
    expect(promptRegistry.get('fingerprint.intent.classify')).toBeDefined();
    expect(promptRegistry.get('fingerprint.language.fallback')).toBeDefined();
    expect(promptRegistry.get('fingerprint.cms.disambiguate')).toBeDefined();
  });

  it('parses safe fallback outputs', () => {
    const industry = promptRegistry.get<any, any>('fingerprint.industry.classify')!;
    expect(industry.parse('not json')).toEqual({ primary: null, secondary: null, confidence: 0, reasons: [] });
  });
});
