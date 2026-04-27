import type { ProbeContext } from '../detectors/types';
export function scoreReadiness(ctx: ProbeContext) { return { score: 100, missing: [] }; }
