import React from 'react'

export function SectionTitle({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="flex items-baseline justify-between mb-1.5">
      <h3 className="text-[10px] uppercase tracking-wider text-[#888] font-semibold">{children}</h3>
      {hint && <span className="text-[10px] text-[#666]">{hint}</span>}
    </div>
  )
}
