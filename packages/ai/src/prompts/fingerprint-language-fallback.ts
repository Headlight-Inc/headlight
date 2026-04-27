import { extractJson } from '../parse';
import type { Prompt } from '../types';

interface In {
  sample: string;
}

interface Out {
  lang: string | null;
  confidence: number;
}

export const fingerprintLanguageFallback: Prompt<In, Out> = {
  id: 'fingerprint.language.fallback',
  version: 'v1.0.0',
  tier: 'S',
  taskType: 'classify',
  system: `Identify the dominant language of a short text snippet. Return BCP-47 primary subtag only ("en", "es", "de", "ja", "bs", "hr", "sr", ...). If the text is mixed or you cannot decide, return null.
Return JSON: { lang, confidence }.`,
  render: (i) => `Snippet:
"""
${i.sample.slice(0, 1024)}
"""
Return JSON only.`,
  parse: (t) => {
    try {
      const j = JSON.parse(extractJson(t));
      const lang = typeof j.lang === 'string' ? j.lang.toLowerCase().split('-')[0] : null;
      return { lang: lang && /^[a-z]{2,3}$/.test(lang) ? lang : null, confidence: Number(j.confidence ?? 0) };
    } catch {
      return { lang: null, confidence: 0 };
    }
  },
};
