import React from 'react'
import { ago } from '../../../../../services/right-sidebar/utils'
export function FreshnessChip({ at }: { at?: string | number | null }) {
  if (!at) return null
  return <span className="inline-flex items-center rounded border border-[#2a2a2a] px-1.5 py-0.5 text-[9px] uppercase tracking-widest text-[#888]">{ago(at)}</span>
}
