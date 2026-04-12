import { CheckRunner } from './CheckRunner';
import { allTier4Checks } from './tier4';

const checkRunner = new CheckRunner();
checkRunner.registerAll(allTier4Checks);

export { checkRunner };
export { CheckRunner } from './CheckRunner';
export type { CheckResult, CheckEvaluator, SiteContext } from './types';
