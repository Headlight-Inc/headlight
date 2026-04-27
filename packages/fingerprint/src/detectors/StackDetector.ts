import type { DetectorStep } from './types';
export type FpStack = { hosting: string; cdn: string; framework: string; analytics: string[] };
export const STACK_CASCADE: ReadonlyArray<DetectorStep<FpStack>> = [];
export const emptyStack = () => ({ hosting: 'unknown', cdn: 'unknown', framework: 'unknown', analytics: [] });
