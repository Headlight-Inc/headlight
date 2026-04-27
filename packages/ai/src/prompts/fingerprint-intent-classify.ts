import { extractJson } from '../parse';
import type { Prompt } from '../types';

interface In {
  industry: string;
  cms: string;
  templates: Array<{ url: string; templateType: string; titleSlice: string; bodyHead: string }>;
}

interface Out {
  primary: 'commercial' | 'informational' | 'navigational' | 'transactional' | 'unknown';
  perTemplate: Record<string, string>;
  confidence: number;
}

export const fingerprintIntentClassify: Prompt<In, Out> = {
  id: 'fingerprint.intent.classify',
  version: 'v1.0.0',
  tier: 'S',
  taskType: 'classify',
  system: `You classify the dominant search intent of a site from a few representative templates.
Valid intents: commercial (compare/research before buy), informational (learn/how-to), navigational (find specific entity), transactional (act now: buy/sign-up/book).
Give site-level primary and per-template intent.
Return JSON: { primary, perTemplate: { [templateType]: intent }, confidence }.`,
  render: (i) => `Industry: ${i.industry}
CMS: ${i.cms}
Templates:
${i.templates.map((t) => `- [${t.templateType}] ${t.url}\n  title: ${t.titleSlice}\n  body: ${t.bodyHead.slice(0, 320)}`).join('\n')}
Return JSON only.`,
  parse: (t) => {
    try {
      const j = JSON.parse(extractJson(t));
      return {
        primary: j.primary ?? 'unknown',
        perTemplate: j.perTemplate ?? {},
        confidence: Number(j.confidence ?? 0),
      };
    } catch {
      return { primary: 'unknown', perTemplate: {}, confidence: 0 };
    }
  },
};
