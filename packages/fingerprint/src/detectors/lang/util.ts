// packages/fingerprint/src/detectors/lang/util.ts

export function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function extractTitle(html: string): string {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? m[1].trim() : '';
}

export function extractSchemas(html: string): string[] {
  const schemas: string[] = [];
  const matches = html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  for (const match of matches) {
    try {
      const data = JSON.parse(match[1]);
      const types = Array.isArray(data) ? data.map(d => d['@type']) : [data['@type']];
      schemas.push(...types.filter(Boolean));
    } catch {}
  }
  return [...new Set(schemas)];
}

export function iso6393to1(code: string): string {
  // Very simplified mapping for the common ones
  const map: Record<string, string> = {
    'eng': 'en', 'spa': 'es', 'fra': 'fr', 'deu': 'de', 'por': 'pt',
    'ita': 'it', 'nld': 'nl', 'pol': 'pl', 'tur': 'tr', 'rus': 'ru',
    'jpn': 'ja', 'kor': 'ko', 'zho': 'zh', 'ara': 'ar', 'heb': 'he',
  };
  return map[code] || code.slice(0, 2);
}
