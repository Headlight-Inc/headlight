import React from 'react'

export function Sparkline({
  data, width = 80, height = 20, stroke = '#F5364E', invert = false
}: { data: number[]; width?: number; height?: number; stroke?: string; invert?: boolean }) {
  if (data.length < 2) return <div style={ { width, height } } />
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const step = width / (data.length - 1)
  
  const points = data.map((v, i) => {
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
        points={points} 
      />
    </svg>
  )
}
