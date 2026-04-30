// components/seo-crawler/right-sidebar/modes/fullAudit/IntegrationsTab.tsx
import React from 'react'
import {
  Card, Row, Chip, SourceChip, FreshnessChip, SectionTitle,
} from '@/components/seo-crawler/right-sidebar/shared'
import { useSeoCrawler } from '@/contexts/SeoCrawlerContext'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { FullAuditStats } from '@/services/right-sidebar/fullAudit.types'

const SRC = { tier: 'authoritative', name: 'Connections' } as const

export function FullIntegrationsTab({ stats }: RsTabProps<FullAuditStats>) {
  const { openSettings } = useSeoCrawler()
  const i = stats.integrations

  return (
    <div className="flex flex-col gap-3">
      <Card title="Adapters" right={<SourceChip source={SRC} />}>
        {i.adapters.map(a => (
          <Row key={a.id}
            label={
              <span className="flex items-center gap-2">
                <span>{a.label}</span>
                {a.detail && <span className="text-[10px] text-neutral-500">{a.detail}</span>}
              </span>
            }
            value={
              <span className="flex items-center gap-1.5">
                <Chip tone={a.connected ? 'good' : 'bad'}>{a.connected ? '✓' : '✗'}</Chip>
                <FreshnessChip at={a.lastSyncAt ?? undefined} />
              </span>
            }
          />
        ))}
      </Card>

      <Card title="Data freshness">
        {i.freshness.map(f => (
          <Row key={f.id} label={f.label} value={<span className="text-[11px] text-neutral-400">{f.description}</span>} />
        ))}
      </Card>

      <Card title="Coverage">
        {i.coverage.map(c => (
          <Row key={c.label} label={c.label} value={`${c.value}%`}
            tone={c.value >= 80 ? 'good' : c.value >= 50 ? 'warn' : 'bad'} />
        ))}
      </Card>

      {i.missing.length > 0 && (
        <Card title="Missing adapters">
          {i.missing.map(m => (
            <Row key={m.id} label={m.label} value={<Chip tone="warn">missing</Chip>} />
          ))}
        </Card>
      )}

      <button
        onClick={() => openSettings?.('integrations')}
        className="self-start rounded bg-neutral-800 px-3 py-1.5 text-[11px] hover:bg-neutral-700"
      >
        Open settings →
      </button>
    </div>
  )
}
