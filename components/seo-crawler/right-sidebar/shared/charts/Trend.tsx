import React from 'react'
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'

export function Trend({ delta, suffix }: { delta: number; suffix?: string }) {
  const Icon = delta > 0 ? ArrowUpRight : delta < 0 ? ArrowDownRight : Minus
  const color = delta > 0 ? 'text-[#4ade80]' : delta < 0 ? 'text-[#f87171]' : 'text-[#888]'
  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] font-mono ${color}`}>
      <Icon size={10} />{Math.abs(delta).toFixed(1)}{suffix ?? '%'}
    </span>
  )
}
