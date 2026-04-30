import React from 'react'
import type { RsAction } from '../../../../services/right-sidebar/types'
import { Chip } from './Chip'
export function ActionsList({ actions, max }: { actions: ReadonlyArray<RsAction>; max?: number }) {
  const list = max ? actions.slice(0, max) : actions
  if (!list.length) return <div className="text-[11px] italic text-[#555]">No actions.</div>
  return (
    <ul className="space-y-1.5">
      {list.map(a => (
        <li key={a.id} className="flex items-start gap-2">
          <Chip tone={a.severity === 'blocking' || a.severity === 'revenueLoss' ? 'bad' :
                       a.severity === 'highLeverage' ? 'warn' : 'neutral'}>
            {a.severity === 'blocking' ? 'P0' : a.severity === 'revenueLoss' ? 'P1' :
             a.severity === 'highLeverage' ? 'P2' : a.severity === 'strategic' ? 'P3' : 'P4'}
          </Chip>
          <div className="flex-1 min-w-0">
            <div className="text-[12px] text-[#ddd] truncate">{a.label}</div>
            <div className="text-[10px] text-[#666]">
              effort {a.effort} · impact {a.impact}{a.pagesAffected != null ? ` · ${a.pagesAffected} pages` : ''}
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
