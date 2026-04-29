import React from 'react'

export function Card({
  title, right, children, dense, className,
}: {
  title?: React.ReactNode
  right?: React.ReactNode
  children: React.ReactNode
  dense?: boolean
  className?: string
}) {
  return (
    <div className={`rounded-md border border-[#1a1a1a] bg-[#0d0d0d] ${dense ? 'p-2' : 'p-3'} ${className ?? ''}`}>
      {(title || right) && (
        <div className="flex items-center justify-between mb-2">
          {typeof title === 'string'
            ? <div className="text-[10px] uppercase tracking-wider text-[#888] font-semibold">{title}</div>
            : title}
          {right}
        </div>
      )}
      {children}
    </div>
  )
}

export function CardNested({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded border border-[#1a1a1a] bg-[#080808] p-2 ${className ?? ''}`}>{children}</div>
}
