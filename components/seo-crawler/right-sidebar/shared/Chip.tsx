import React from 'react'
import type { RsAccent } from '../../../../services/right-sidebar/types'

type Tone = 'good' | 'warn' | 'bad' | 'info' | 'neutral' | RsAccent

const TONE_BG: Record<Tone, string> = {
  good:    'bg-[#0e2a1a] text-[#4ade80] border-[#16432a]',
  warn:    'bg-[#2a210e] text-[#fbbf24] border-[#43361a]',
  bad:     'bg-[#2a0e0e] text-[#f87171] border-[#431a1a]',
  info:    'bg-[#0e1a2a] text-[#60a5fa] border-[#1a2a43]',
  neutral: 'bg-[#161616] text-[#aaa] border-[#222]',
  slate:   'bg-[#161823] text-[#c7d2fe] border-[#1f2236]',
  violet:  'bg-[#231230] text-[#c4b5fd] border-[#3a1f4d]',
  blue:    'bg-[#0e1c2e] text-[#93c5fd] border-[#1c2f4d]',
  amber:   'bg-[#2b210b] text-[#fcd34d] border-[#4a3814]',
  teal:    'bg-[#0c2627] text-[#5eead4] border-[#13403f]',
  rose:    'bg-[#2b1019] text-[#fda4af] border-[#4a1c2c]',
  cyan:    'bg-[#0b242b] text-[#67e8f9] border-[#143b46]',
  green:   'bg-[#0e2a1a] text-[#86efac] border-[#16432a]',
  indigo:  'bg-[#161a3a] text-[#a5b4fc] border-[#1f2557]',
  fuchsia: 'bg-[#2a0f2a] text-[#f0abfc] border-[#4a1a4a]',
  red:     'bg-[#2a0e0e] text-[#fca5a5] border-[#431a1a]',
  orange:  'bg-[#2a1a0d] text-[#fdba74] border-[#43281a]',
}

export function Chip({
  tone = 'neutral', children, dense,
}: { tone?: Tone; children: React.ReactNode; dense?: boolean }) {
  return (
    <span className={`inline-flex items-center rounded ${dense ? 'px-1 py-[1px] text-[9px]' : 'px-1.5 py-0.5 text-[10px]'} font-medium border whitespace-nowrap ${TONE_BG[tone]}`}>
      {children}
    </span>
  )
}
