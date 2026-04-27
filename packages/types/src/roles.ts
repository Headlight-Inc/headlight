export const METRIC_ROLES = ['G', 'I', 'R', 'L', 'H', 'B', 'V', 'X', 'K', 'A', 'S', 'T', 'E'] as const;

export type MetricRole = typeof METRIC_ROLES[number];

export const METRIC_ROLE_LABEL: Record<MetricRole, string> = {
  G: 'Goal',
  I: 'Input',
  R: 'Result',
  L: 'Leading',
  H: 'Health',
  B: 'Baseline',
  V: 'Velocity',
  X: 'Explainer',
  K: 'Key',
  A: 'Actionable',
  S: 'Segment',
  T: 'Target',
  E: 'Exception',
};
