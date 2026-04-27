import { initCatalog } from '../../../packages/metrics/src/catalog';
import { registerAllModes } from '../../../packages/modes/src';
import { registerFingerprintPrompts } from '../../../packages/ai/src';

export function bootDataLayer() {
  registerAllModes();
  initCatalog();
  registerFingerprintPrompts();
}
