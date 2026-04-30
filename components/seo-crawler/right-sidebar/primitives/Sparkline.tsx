import React from 'react'
export function Sparkline({ points, w = 110, h = 24, stroke = '#F5364E' }: {
    points: number[]; w?: number; h?: number; stroke?: string
}) {
    if (!points || points.length === 0) return null
    const min = Math.min(...points)
    const max = Math.max(...points)
    const span = max - min || 1
    const step = w / Math.max(1, points.length - 1)
    const d = points.map((v, i) => `${i === 0 ? 'M' : 'L'} ${i * step} ${h - ((v - min) / span) * h}`).join(' ')
    return (
        <svg width={w} height={h} className="block">
            <path d={d} fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}
