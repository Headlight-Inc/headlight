import React from 'react'
import type { SourceStamp } from '../../../../../services/right-sidebar/types'
export function SourceChip({ source }: { source: SourceStamp }) {
  const tone =
    source.tier === 'authoritative' ? 'border-emerald-700/40 text-emerald-300' :
    source.tier === 'browser'       ? 'border-blue-700/40 text-blue-300' :
    source.tier === 'scrape'        ? 'border-amber-700/40 text-amber-300' :
    source.tier === 'ai'            ? 'border-fuchsia-700/40 text-fuchsia-300' :
                                      'border-[#2a2a2a] text-[#aaa]'
  return <span className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[9px] uppercase tracking-widest ${tone}`}>{source.name}</span>
}
