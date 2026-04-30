import React from 'react'
import { ProgressBar } from './ProgressBar'
export function ScoreBreakdown({ parts }: { parts: ReadonlyArray<{ label: string; weight: number; value: number }> }) {
  return (
    <div className="space-y-1.5">
      {parts.map((p, i) => (
        <div key={i}>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-[#888]">{p.label} <span className="text-[#555]">×{p.weight.toFixed(2)}</span></span>
            <span className="font-mono tabular-nums text-[#ddd]">{Math.round(p.value)}</span>
          </div>
          <ProgressBar value={p.value} max={100} />
        </div>
      ))}
    </div>
  )
}
