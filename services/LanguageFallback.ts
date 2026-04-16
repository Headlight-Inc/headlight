/**
 * LanguageFallback.ts
 *
 * Detects language from text content when <html lang> is missing/wrong.
 * Uses franc-min (small footprint, ~200 languages).
 */
import { franc } from 'franc-min';

// franc returns ISO-639-3; we want ISO-639-1 (two-letter)
const ISO3_TO_ISO1: Record<string, string> = {
  eng: 'en', deu: 'de', fra: 'fr', spa: 'es', ita: 'it', por: 'pt',
  nld: 'nl', pol: 'pl', ces: 'cs', slk: 'sk', hrv: 'hr', srp: 'sr',
  bos: 'bs', slv: 'sl', tur: 'tr', rus: 'ru', ukr: 'uk', ell: 'el',
  swe: 'sv', nor: 'no', dan: 'da', fin: 'fi', hun: 'hu', ron: 'ro',
  bul: 'bg', ara: 'ar', heb: 'he', jpn: 'ja', kor: 'ko', zho: 'zh',
  hin: 'hi', tha: 'th', vie: 'vi', ind: 'id', msa: 'ms',
};

export function detectLanguageFromText(text: string): string | null {
  if (!text || text.length < 50) return null;
  const truncated = text.slice(0, 2000); // franc is fine with short samples
  const iso3 = franc(truncated, { minLength: 50 });
  if (iso3 === 'und') return null;
  return ISO3_TO_ISO1[iso3] || null;
}

/**
 * Resolve a page's final language by combining <html lang>, GSC country,
 * and content-based detection.
 */
export function resolvePageLanguage(page: {
  language?: string;
  textContent?: string;
  title?: string;
  h1_1?: string;
}): string {
  const declared = String(page.language || '').split('-')[0].toLowerCase().trim();
  if (declared && declared.length === 2) return declared;

  const sample = [page.title, page.h1_1, page.textContent].filter(Boolean).join(' ');
  const detected = detectLanguageFromText(sample);
  return detected || 'unknown';
}
