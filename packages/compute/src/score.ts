// packages/compute/src/score.ts

export interface ScoreComponent {
	weight: number;
	value: number; // 0..100
}

export function computeCompositeScore(components: Record<string, ScoreComponent>): number {
	let totalWeight = 0;
	let weightedSum = 0;

	for (const comp of Object.values(components)) {
		weightedSum += comp.value * comp.weight;
		totalWeight += comp.weight;
	}

	return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
}
