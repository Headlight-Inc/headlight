// packages/fingerprint/src/FingerprintProbe.ts
import { runCascade } from './cascades';
import { INDUSTRY_CASCADE } from './detectors/IndustryCascade';
import { CMS_CASCADE } from './detectors/CmsCascade';
import { LANGUAGE_CASCADE } from './detectors/LanguageDetector';
import { STACK_CASCADE, emptyStack } from './detectors/StackDetector';
import { GEO_CASCADE } from './detectors/GeoDetector';
import { INTENT_CASCADE } from './detectors/IntentDetector';
import { SIZE_CASCADE } from './detectors/SizeDetector';
import { scoreReadiness } from './scoring/readiness';
import type { ProbeContext } from './detectors/types';
import type { LanguageCode } from '@headlight/types';

export interface FingerprintResult {
	projectId: string;
	industry: import('./cascades').FpValue<import('@headlight/types').Industry>;
	industrySecondary?: import('./cascades').FpValue<import('@headlight/types').Industry>;
	cms: import('./cascades').FpValue<import('@headlight/types').CmsKey>;
	languagePrimary: import('./cascades').FpValue<import('@headlight/types').LanguageCode>;
	languageSet: ReadonlyArray<{ code: import('@headlight/types').LanguageCode; ratio: number }>;
	stack: import('./detectors/StackDetector').FpStack;
	geo: { primary: import('./cascades').FpValue<string>; locales: import('./cascades').FpValue<string[]> };
	intent: import('./cascades').FpValue<string>;
	size: { urls: import('./cascades').FpValue<number> };
	readiness: { score: number; missing: string[] };
	probedAt: string;
}

export async function runFingerprint(input: { ctx: ProbeContext }): Promise<FingerprintResult> {
	const ctx = input.ctx;
	const industry = await runCascade(ctx, INDUSTRY_CASCADE, { defaultValue: 'general', defaultProvider: 'fingerprint.industry.default' });
	const cms      = await runCascade(ctx, CMS_CASCADE,      { defaultValue: 'custom',  defaultProvider: 'fingerprint.cms.default' });
	const language = await runCascade(ctx, LANGUAGE_CASCADE, { defaultValue: 'unknown', defaultProvider: 'fingerprint.lang.default' });
	const stack    = await runCascade(ctx, STACK_CASCADE,    { defaultValue: emptyStack(), defaultProvider: 'fingerprint.stack.default' });
	const geo      = await runCascade(ctx, GEO_CASCADE,      { defaultValue: 'unknown', defaultProvider: 'fingerprint.geo.default' });
	const intent   = await runCascade(ctx, INTENT_CASCADE,   { defaultValue: 'unknown', defaultProvider: 'fingerprint.intent.default' });
	const size     = await runCascade(ctx, SIZE_CASCADE,     { defaultValue: ctx.htmlSamples.length, defaultProvider: 'fingerprint.size.default' });

	return {
		projectId: ctx.projectId,
		industry,
		cms,
		languagePrimary: language,
		languageSet: deriveLanguageSet(ctx),
		stack: stack.value,
		geo: { primary: geo, locales: { value: [`${language.value}-${geo.value}`], confidence: 0.5, source: { tier: 'T8', tags: ['default'], provider: 'fingerprint.geo.locales.default', observedAt: new Date().toISOString() } } },
		intent,
		size: { urls: size },
		readiness: scoreReadiness(ctx),
		probedAt: new Date().toISOString(),
	};
}

function deriveLanguageSet(ctx: ProbeContext): Array<{ code: LanguageCode; ratio: number }> {
    return [{ code: 'en' as LanguageCode, ratio: 1.0 }];
}
