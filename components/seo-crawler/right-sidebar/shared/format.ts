export const fmtInt = (n: number | undefined | null) =>
	n == null || !Number.isFinite(n) ? '—' : new Intl.NumberFormat('en-US').format(Math.round(n))

export const fmtPct = (n: number | undefined | null, digits = 0) =>
	n == null || !Number.isFinite(n) ? '—' : `${(n * 100).toFixed(digits)}%`

export const fmtScore = (n: number | undefined | null) =>
	n == null || !Number.isFinite(n) ? '—' : `${Math.round(n)}/100`

export const fmtBytes = (n: number | undefined | null) => {
	if (n == null || !Number.isFinite(n)) return '—'
	const u = ['B','KB','MB','GB']
	let i = 0; let v = n
	while (v >= 1024 && i < u.length - 1) { v /= 1024; i++ }
	return `${v.toFixed(v < 10 ? 1 : 0)} ${u[i]}`
}

export const fmtMs = (n: number | undefined | null) =>
	n == null || !Number.isFinite(n) ? '—' : n < 1000 ? `${Math.round(n)}ms` : `${(n / 1000).toFixed(2)}s`

export function scoreTone(score: number): string {
	if (score >= 80) return '#34d399'
	if (score >= 50) return '#fbbf24'
	return '#fb7185'
}
