import React from 'react'

type MiniBarItem = { label: string; value: number; tone?: 'good' | 'warn' | 'bad' | 'info' }

export function MiniBar({ data, max }: { data: MiniBarItem[]; max?: number }) {
  const cap = max ?? Math.max(1, ...data.map(d => d.value))
  const color = (t?: string) => t === 'bad' ? '#ef4444' : t === 'warn' ? '#f59e0b' : t === 'good' ? '#22c55e' : '#a78bfa'
  return (
    <div className="flex flex-col gap-1.5">
      {data.map((d) => (
        <div key={d.label} className="flex flex-col gap-0.5">
          <div className="flex items-center justify-between text-[9px] uppercase tracking-wider">
            <span className="text-[#666]">{d.label}</span>
            <span className="text-[#999] font-mono">{d.value}</span>
          </div>
          <div className="h-[4px] bg-[#121212] rounded-full overflow-hidden">
            <div 
              className="h-full transition-all duration-500 ease-out" 
              style={ { width: `${(d.value / cap) * 100}%`, background: color(d.tone) } } 
            />
          </div>
        </div>
      ))}
    </div>
  )
}

export function ProgressBar({ value, max = 100, tone }: { value: number; max?: number; tone?: 'good' | 'warn' | 'bad' | 'info' }) {
  const color = (t?: string) => t === 'bad' ? '#ef4444' : t === 'warn' ? '#f59e0b' : t === 'good' ? '#22c55e' : '#a78bfa'
  return (
    <div className="h-[4px] bg-[#121212] rounded-full overflow-hidden">
      <div 
        className="h-full transition-all duration-500 ease-out" 
        style={ { width: `${(value / max) * 100}%`, background: color(tone) } } 
      />
    </div>
  )
}
