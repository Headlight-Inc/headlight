import type { Deduction } from '../_shared'

export function computeDeductions({
	pillars, tech, issues, perf,
}: { pillars: any[]; tech: any; issues: any; perf: any }): { items: Deduction[]; totalLost: number } {
	const items: Deduction[] = []
	const push = (id: string, label: string, points: number) => { if (points > 0) items.push({ id, label, points }) }

	push('not-indexable', `${issues.notIndexable} pages not indexable`, issues.notIndexable * 0.4)
	push('cwv-fail', `${perf.lcpFail + perf.inpFail + perf.clsFail} pages fail Core Web Vitals`, (perf.lcpFail + perf.inpFail + perf.clsFail) * 0.3)
	push('errors-4xx', `${issues.errors4xx} pages return 4xx`, issues.errors4xx * 0.5)
	push('errors-5xx', `${issues.errors5xx} pages return 5xx`, issues.errors5xx * 1.2)
	push('schema', `Schema errors on ${issues.canonicalMismatch + issues.notIndexable} pages`, issues.canonicalMismatch * 0.2)
	push('orphans', `${issues.orphans} orphan pages`, issues.orphans * 0.4)
	push('thin', `${issues.missingAlt} images missing alt`, Math.min(issues.missingAlt * 0.05, 8))

	items.sort((a, b) => b.points - a.points)
	const totalLost = items.reduce((a, b) => a + b.points, 0)
	return { items: items.slice(0, 6), totalLost }
}
