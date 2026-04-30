import React from 'react'

export function StackedBar({
  data, segments, height = 8,
}: { 
  data?: { value?: number; count?: number; color?: string; tone?: string; label?: string }[]
  segments?: { value?: number; count?: number; color?: string; tone?: string; label?: string }[]
  height?: number 
}) {
  const rawItems = data ?? segments ?? []
  const items = rawItems.map(item => ({
    ...item,
    value: item.value ?? item.count ?? 0
  }))
  
  const total = items.reduce((s, x) => s + x.value, 0) || 1
  
  const getColor = (c?: string, t?: string) => {
    const key = c ?? t ?? 'neutral'
    if (key === 'good') return '#4ade80'
    if (key === 'info') return '#60a5fa'
    if (key === 'warn') return '#fbbf24'
    if (key === 'bad')  return '#f87171'
    if (key === 'neutral') return '#4b5563'
    return key
  }

  return (
    <div className="w-full overflow-hidden rounded-full flex bg-white/5" style={{ height }}>
      {items.map((s, i) => (
        <div 
          key={i} 
          title={s.label} 
          className="transition-all duration-500 first:rounded-l-full last:rounded-r-full"
          style={{ width: `${(s.value / total) * 100}%`, backgroundColor: getColor(s.color, s.tone) }} 
        />
      ))}
    </div>
  )
}
