/**
 * LanguageAdaptation.ts
 *
 * Adapts WQA behavior for language-specific reliability constraints.
 */

const LATIN_SCRIPT_LANGUAGES = new Set([
	"en",
	"de",
	"nl",
	"fr",
	"es",
	"it",
	"pt",
	"sv",
	"da",
	"no",
	"fi",
	"pl",
	"cs",
	"sk",
	"hu",
	"ro",
	"hr",
	"bs",
	"sl",
	"sq",
	"lt",
	"lv",
	"et",
	"tr",
	"az",
	"vi",
	"id",
	"ms",
	"tl",
	"sw",
	"cy",
	"ga",
	"eu",
	"ca",
	"gl",
]);

const FLESCH_SUPPORTED = new Set(["en", "de", "nl", "fr", "es", "it", "pt"]);
const SPELLING_SUPPORTED = new Set(["en"]);

function toBaseLang(langCode: string): string {
	const raw = String(langCode || "unknown")
		.trim()
		.toLowerCase();
	if (!raw) return "unknown";
	return raw.split("-")[0] || "unknown";
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

export function shouldPenalizeNonAsciiUrls(langCode: string): boolean {
	return isLatinScriptLanguage(langCode);
}

export function getReadabilityLabel(
	fleschScore: number,
	langCode: string,
): { label: string; reliable: boolean } {
	if (!isReadabilityReliable(langCode)) {
		return { label: "N/A (not supported for this language)", reliable: false };
	}

	if (fleschScore >= 80) return { label: "Easy", reliable: true };
	if (fleschScore >= 60) return { label: "Standard", reliable: true };
	return { label: "Difficult", reliable: true };
}

export function getSpellingDisclaimer(langCode: string): string | null {
	if (isSpellingReliable(langCode)) return null;
	return "Spelling checks are not available for this language.";
}

/**
 * Returns columns that should be hidden in a given language context.
 */
export function getHiddenColumnsForLanguage(langCode: string): string[] {
	const hidden: string[] = [];

	if (!isSpellingReliable(langCode)) {
		hidden.push("spellingErrors", "grammarErrors");
	}

	if (!isReadabilityReliable(langCode)) {
		hidden.push("fleschScore");
	}

	return hidden;
}
