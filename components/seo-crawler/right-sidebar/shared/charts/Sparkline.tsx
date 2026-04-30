import React from 'react'

export function Sparkline({
  data, points: pointsData, width = 80, height = 20, stroke = '#F5364E', invert = false
}: { data?: number[]; points?: number[]; width?: number; height?: number; stroke?: string; invert?: boolean }) {
  const items = data ?? pointsData ?? []
  if (items.length < 2) return <div style={ { width, height } } />
  const min = Math.min(...items)
  const max = Math.max(...items)
  const range = max - min || 1
  const step = width / (items.length - 1)
  
  const pointsStr = items.map((v, i) => {
    const x = i * step
    const yRatio = (v - min) / range
    const y = invert ? (yRatio * height) : (height - (yRatio * height))
    return `${x.toFixed(2)},${y.toFixed(2)}`
  }).join(' ')

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <polyline 
        fill="none" 
        stroke={stroke} 
        strokeWidth={1.5} 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        points={pointsStr} 
      />
    </svg>
  )
}
