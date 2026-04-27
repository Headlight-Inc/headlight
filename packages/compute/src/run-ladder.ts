// packages/compute/src/run-ladder.ts
import type { MetricDef, MetricSample, SourceTier } from '@headlight/types';

export function resolveMetricFromLadder(
	def: MetricDef,
	samples: MetricSample[]
): MetricSample | null {
	// Sort samples by tier priority (T0 > T1 > ... > T8)
	const sorted = [...samples].sort((a, b) => {
		const tierA = parseInt(a.stamp.tier.slice(1));
		const tierB = parseInt(b.stamp.tier.slice(1));
		return tierA - tierB;
	});

	// Return the first sample that matches the metric key and has a valid tier
	return sorted.find(s => s.key === def.key) || null;
}
