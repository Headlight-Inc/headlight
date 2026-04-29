import React from 'react'
import { Chip } from './Chip'

export interface RsAction {
  id: string
  label: string
  effort: 'low' | 'medium' | 'high'
  impact: number
  filter?: unknown
}

export function ActionsList({
  actions, onPick, max = 8,
}: { actions: RsAction[]; onPick?: (a: RsAction) => void; max?: number }) {
  const list = actions.slice(0, max)
  if (list.length === 0) {
    return <div className="text-[10px] text-[#666] px-1 py-2">No quick fixes detected. Crawl deeper for more.</div>
  }
  return (
    <ul className="flex flex-col gap-1">
      {list.map(a => (
        <li key={a.id}>
          <button
            onClick={() => onPick?.(a)}
            className="w-full text-left rounded border border-[#1a1a1a] bg-[#0d0d0d] hover:bg-[#161616] px-2 py-1.5 flex items-center justify-between gap-2"
          >
            <span className="text-[11px] text-[#ddd] truncate flex-1">{a.label}</span>
            <Chip tone={a.effort === 'low' ? 'good' : a.effort === 'medium' ? 'warn' : 'bad'} dense>{a.effort}</Chip>
          </button>
        </li>
      ))}
    </ul>
  )
}
