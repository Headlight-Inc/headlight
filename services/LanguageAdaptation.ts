/**
 * LanguageAdaptation.ts
 *
 * Adapts WQA behavior for language-specific reliability constraints.
 */

const LATIN_SCRIPT_LANGUAGES = new Set([
  'en', 'de', 'nl', 'fr', 'es', 'it', 'pt', 'sv', 'da', 'no', 'fi',
  'pl', 'cs', 'sk', 'hu', 'ro', 'hr', 'bs', 'sl', 'sq', 'lt', 'lv', 'et',
  'tr', 'az', 'vi', 'id', 'ms', 'tl', 'sw', 'cy', 'ga', 'eu', 'ca', 'gl',
]);

// Languages written right-to-left
const RTL_LANGUAGES = new Set([
  'ar', 'he', 'fa', 'ur', 'ps', 'sd', 'ug', 'yi', 'dv', 'ku',
]);

const FLESCH_SUPPORTED = new Set(['en', 'de', 'nl', 'fr', 'es', 'it', 'pt']);
const SPELLING_SUPPORTED = new Set(['en']);

function toBaseLang(langCode: string): string {
  const raw = String(langCode || 'unknown').trim().toLowerCase();
  if (!raw) return 'unknown';
  return raw.split('-')[0] || 'unknown';
}

export function isReadabilityReliable(langCode: string): boolean {
  return FLESCH_SUPPORTED.has(toBaseLang(langCode));
}

export function isSpellingReliable(langCode: string): boolean {
  return SPELLING_SUPPORTED.has(toBaseLang(langCode));
}

export function isLatinScriptLanguage(langCode: string): boolean {
  return LATIN_SCRIPT_LANGUAGES.has(toBaseLang(langCode));
}

/** True for Arabic, Hebrew, Persian, Urdu, and other RTL scripts */
export function isRtlLanguage(langCode: string): boolean {
  return RTL_LANGUAGES.has(toBaseLang(langCode));
}

/**
 * When true, non-ASCII characters in URLs are not penalized.
 * RTL languages often use transliterated URLs, so we only penalize
 * for Latin-script languages where ASCII URLs are the standard.
 */
export function shouldPenalizeNonAsciiUrls(langCode: string): boolean {
  return isLatinScriptLanguage(langCode) && !isRtlLanguage(langCode);
}

export function getReadabilityLabel(
  fleschScore: number,
  langCode: string
): { label: string; reliable: boolean } {
  if (!isReadabilityReliable(langCode)) {
    return { label: 'N/A', reliable: false };
  }
  if (fleschScore >= 80) return { label: 'Easy', reliable: true };
  if (fleschScore >= 60) return { label: 'Standard', reliable: true };
  return { label: 'Difficult', reliable: true };
}

export function getSpellingDisclaimer(langCode: string): string | null {
  if (isSpellingReliable(langCode)) return null;
  return 'Spelling checks are not available for this language.';
}

/**
 * Returns columns that should be hidden in a given language context.
 */
export function getHiddenColumnsForLanguage(langCode: string): string[] {
  const hidden: string[] = [];

  if (!isSpellingReliable(langCode)) {
    hidden.push('spellingErrors', 'grammarErrors');
  }

  if (!isReadabilityReliable(langCode)) {
    hidden.push('fleschScore');
  }

  // For RTL languages, hide columns that rely on left-to-right reading
  // heuristics that produce unreliable scores (e.g. Flesch is already hidden above)
  // No additional columns need hiding — RTL sites are otherwise fully supported.

  return hidden;
}

/**
 * Returns a UI hint to surface in the WQA header/sidebar when the
 * detected language has limited analysis support.
 */
export function getLanguageSupportNote(langCode: string): string | null {
  const base = toBaseLang(langCode);

  if (isRtlLanguage(base)) {
    return 'RTL language detected. Readability and spelling scores are not available. All other metrics are fully supported.';
  }
  if (!isLatinScriptLanguage(base) && base !== 'unknown') {
    return 'Non-Latin script detected. Readability and spelling scores are not available.';
  }
  if (!isSpellingReliable(base) || !isReadabilityReliable(base)) {
    return 'Some text analysis features are limited for this language.';
  }
  return null;
}
