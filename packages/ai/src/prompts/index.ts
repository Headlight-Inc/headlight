import { promptRegistry } from '../registry';
import { fingerprintCmsDisambiguate } from './fingerprint-cms-disambiguate';
import { fingerprintIndustryClassify } from './fingerprint-industry-classify';
import { fingerprintIntentClassify } from './fingerprint-intent-classify';
import { fingerprintLanguageFallback } from './fingerprint-language-fallback';

export function registerFingerprintPrompts() {
  promptRegistry.register(fingerprintIndustryClassify);
  promptRegistry.register(fingerprintIntentClassify);
  promptRegistry.register(fingerprintLanguageFallback);
  promptRegistry.register(fingerprintCmsDisambiguate);
}
