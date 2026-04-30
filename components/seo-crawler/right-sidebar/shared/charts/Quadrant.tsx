// components/seo-crawler/right-sidebar/shared/charts/Quadrant.tsx
export interface QuadrantPoint { x: number; y: number; label?: string; tone?: 'good' | 'warn' | 'bad' }

export function Quadrant({
  points, xLabel, yLabel, midX, midY, height = 160,
  quadrantLabels = { tl: '', tr: 'stars', bl: 'cut', br: 'fix' },
}: {
  points: QuadrantPoint[]
  xLabel: string
  yLabel: string
  midX: number
  midY: number
  height?: number
  quadrantLabels?: { tl?: string; tr?: string; bl?: string; br?: string }
}) {
  const xs = points.map(p => p.x), ys = points.map(p => p.y)
  const xMin = Math.min(0, ...xs), xMax = Math.max(midX * 2, ...xs)
  const yMin = Math.min(0, ...ys), yMax = Math.max(midY * 2, ...ys)
  const proj = (x: number, y: number) => ({
    cx: ((x - xMin) / Math.max(1, xMax - xMin)) * 100,
    cy: 100 - ((y - yMin) / Math.max(1, yMax - yMin)) * 100,
  })
  const dotCls = (t?: QuadrantPoint['tone']) =>
    t === 'good' ? 'fill-emerald-400' : t === 'warn' ? 'fill-amber-400' : t === 'bad' ? 'fill-red-400' : 'fill-neutral-400'
  const xMid = ((midX - xMin) / Math.max(1, xMax - xMin)) * 100
  const yMid = 100 - ((midY - yMin) / Math.max(1, yMax - yMin)) * 100
  return (
    <div className="relative" style={{ height }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
        <line x1={xMid} y1={0} x2={xMid} y2={100} stroke="#1a1a1a" strokeWidth={0.4} />
        <line x1={0} y1={yMid} x2={100} y2={yMid} stroke="#1a1a1a" strokeWidth={0.4} />
        {points.map((p, i) => {
          const { cx, cy } = proj(p.x, p.y)
          return <circle key={i} cx={cx} cy={cy} r={1.2} className={dotCls(p.tone)} />
        })}
      </svg>
      <div className="absolute inset-0 text-[9px] text-[#555] pointer-events-none">
        <span className="absolute top-0 left-1">{quadrantLabels.tl}</span>
        <span className="absolute top-0 right-1">{quadrantLabels.tr}</span>
        <span className="absolute bottom-0 left-1">{quadrantLabels.bl}</span>
        <span className="absolute bottom-0 right-1">{quadrantLabels.br}</span>
        <span className="absolute -bottom-3 left-1/2 -translate-x-1/2">{xLabel}</span>
        <span className="absolute -left-1 top-1/2 -translate-y-1/2 -rotate-90 origin-left">{yLabel}</span>
      </div>
    </div>
  )
}
