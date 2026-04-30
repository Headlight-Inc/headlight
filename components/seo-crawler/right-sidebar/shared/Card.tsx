import React from 'react'

export function Card({
  title, right, children, padding = true,
}: { title?: React.ReactNode; right?: React.ReactNode; children: React.ReactNode; padding?: boolean }) {
  return (
    <section className="bg-[#0a0a0a] border border-[#222] rounded">
      {(title || right) && (
        <header className="flex items-center justify-between px-3 h-7 border-b border-[#1a1a1a]">
          <span className="text-[10px] uppercase tracking-widest text-[#666] font-bold">{title}</span>
          {right && <span className="flex items-center gap-1">{right}</span>}
        </header>
      )}
      <div className={padding ? 'p-3' : ''}>{children}</div>
    </section>
  )
}
