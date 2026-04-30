import React from 'react'
import { Card, Row, Chip } from '../../shared'
import type { RsTabProps } from '../../../../../services/right-sidebar/types'
import type { UxConversionStats } from '../../../../../services/right-sidebar/uxConversion'

export function UxTestsTab({ stats: { tests: t } }: RsTabProps<UxConversionStats>) {
  return (
    <div className="flex flex-col gap-3 p-3">
      <Card title="Pipeline">
        <Row label="Active tests" value={t.activeTests} />
        <Row label="Backlog"      value={t.backlog} />
      </Card>
      <Card title="Recent lifts">
        {t.lifts.length === 0 ? <div className="text-[11px] italic text-[#555]">No completed tests.</div>
          : t.lifts.slice(0, 6).map(l => (
              <div key={l.name} className="flex items-center justify-between py-1 text-[12px]">
                <span className="text-[#ddd] truncate pr-3">{l.name}</span>
                <span className="flex items-center gap-1">
                  <span className={`font-mono tabular-nums ${l.liftPct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{l.liftPct >= 0 ? '+' : ''}{l.liftPct}%</span>
                  <Chip tone={l.significance === 'high' ? 'good' : l.significance === 'med' ? 'warn' : 'neutral'}>{l.significance}</Chip>
                </span>
              </div>
          ))}
      </Card>
    </div>
  )
}
