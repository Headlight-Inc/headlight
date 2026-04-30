// components/seo-crawler/right-sidebar/shared/charts/Waffle.tsx
export function Waffle({ pct, cells = 100, fillClassName = 'bg-emerald-500/70', emptyClassName = 'bg-[#1a1a1a]' }:
  { pct: number; cells?: number; fillClassName?: string; emptyClassName?: string }) {
  const filled = Math.round((Math.max(0, Math.min(100, pct)) / 100) * cells)
  return (
    <div className="grid grid-cols-10 gap-[2px] w-full max-w-[120px]">
      {Array.from({ length: cells }).map((_, i) => (
        <span key={i} className={`aspect-square rounded-[2px] ${i < filled ? fillClassName : emptyClassName}`} />
      ))}
    </div>
  )
}
