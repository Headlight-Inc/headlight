export const ago = (iso?: string | number | null): string => {
  if (!iso) return '—'
  const t = typeof iso === 'string' ? Date.parse(iso) : iso
  const d = Math.max(0, (Date.now() - t) / 1000)
  if (d < 60)        return `${Math.round(d)}s ago`
  if (d < 3_600)     return `${Math.round(d / 60)}m ago`
  if (d < 86_400)    return `${Math.round(d / 3_600)}h ago`
  if (d < 30 * 86_400) return `${Math.round(d / 86_400)}d ago`
  return new Date(t).toISOString().slice(0, 10)
}

export const fmtInt = (n?: number | null): string =>
  n == null || Number.isNaN(Number(n)) ? '—' : Math.round(Number(n)).toLocaleString()

export const fmtPct = (n?: number | null, mul = 100, digits = 1): string =>
  n == null || Number.isNaN(Number(n)) ? '—' : `${(Number(n) * mul).toFixed(digits)}%`

export const fmtTime = (ms?: number | null): string =>
  ms == null ? '—' : ms < 1000 ? `${Math.round(ms)}ms` : `${(ms / 1000).toFixed(2)}s`

export const scoreTone = (n: number): 'good' | 'warn' | 'bad' =>
  n >= 75 ? 'good' : n >= 50 ? 'warn' : 'bad'

export const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: '8px',
}

export const countWhere = <T,>(arr: ReadonlyArray<T>, fn: (x: T) => unknown): number =>
  arr.reduce((n, x) => (fn(x) ? n + 1 : n), 0)

export const dedupCount = <T,>(arr: ReadonlyArray<T>, key: (x: T) => string | null): number => {
  const seen = new Map<string, number>()
  for (const x of arr) {
    const k = key(x); if (!k) continue
    seen.set(k, (seen.get(k) ?? 0) + 1)
  }
  let dups = 0
  for (const v of seen.values()) if (v > 1) dups += v
  return dups
}

export const percentile = (arr: ReadonlyArray<number>, p: number): number => {
  if (arr.length === 0) return 0
  const sorted = [...arr].sort((a, b) => a - b)
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.floor((p / 100) * (sorted.length - 1))))
  return sorted[idx]
}

export const avg = (arr: ReadonlyArray<number>): number =>
  arr.length === 0 ? 0 : arr.reduce((s, x) => s + x, 0) / arr.length

export const pct = (n: number, d: number): number =>
  d <= 0 ? 0 : Math.round((n / d) * 100)

export const topN = <T extends { count: number }>(arr: ReadonlyArray<T>, n: number): T[] =>
  [...arr].sort((a, b) => b.count - a.count).slice(0, n)

export const isThin = (p: any): boolean => Number(p?.wordCount ?? 0) > 0 && Number(p?.wordCount) < 300
export const isIndexable = (p: any): boolean => p?.indexable !== false && Number(p?.statusCode ?? 0) === 200
export const hasTitle = (p: any): boolean => !!String(p?.title ?? '').trim()
export const hasMetaDescription = (p: any): boolean => !!String(p?.metaDesc ?? '').trim()
export const hasH1 = (p: any): boolean => !!String(p?.h1_1 ?? '').trim()
export const isPdp = (p: any): boolean =>
  Array.isArray(p?.schemaTypes) && p.schemaTypes.some((t: string) => /^(Product|Offer)$/i.test(t))
