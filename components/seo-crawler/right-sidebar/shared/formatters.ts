export function ago(ts: number): string {
  const s = Math.max(0, Math.floor((Date.now() - ts) / 1000))
  if (s < 60)         return `${s}s ago`
  if (s < 3600)       return `${Math.floor(s / 60)}m ago`
  if (s < 86400)      return `${Math.floor(s / 3600)}h ago`
  if (s < 7 * 86400)  return `${Math.floor(s / 86400)}d ago`
  return new Date(ts).toLocaleDateString()
}

export function fmtBytes(b: number): string {
  if (!Number.isFinite(b) || b <= 0) return '—'
  const u = ['B', 'KB', 'MB', 'GB']
  let i = 0; let v = b
  while (v >= 1024 && i < u.length - 1) { v /= 1024; i++ }
  return `${v.toFixed(v >= 10 ? 0 : 1)} ${u[i]}`
}

export function fmtTime(ms: number | null | undefined): string {
  if (ms == null || !Number.isFinite(ms)) return '—'
  if (ms < 1000) return `${Math.round(ms)}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

export function fmtCurrency(n: number, currency = 'USD'): string {
  if (!Number.isFinite(n)) return '—'
  return new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).format(n)
}
