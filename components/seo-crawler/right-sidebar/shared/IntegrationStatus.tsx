import React from 'react'
import { Chip } from './Chip'
import type { CrawlerIntegrationConnection } from '../../../../services/CrawlerIntegrationsService'

export function IntegrationStatus({
  name, conn, onConnect,
}: {
  name: string
  conn: CrawlerIntegrationConnection | undefined
  onConnect?: () => void
}) {
  const status = conn?.status ?? 'disconnected'
  const tone = status === 'connected' ? 'good' : status === 'expired' ? 'warn' : 'bad'
  return (
    <div className="flex items-center justify-between rounded border border-[#1a1a1a] bg-[#0d0d0d] px-2 py-1.5">
      <div className="flex items-center gap-2 min-w-0">
        <Chip tone={tone} dense>{status}</Chip>
        <span className="text-[11px] text-[#ccc] truncate">{name}</span>
      </div>
      {status !== 'connected' && (
        <button onClick={onConnect} className="text-[10px] text-[#F5364E] hover:text-white">Connect →</button>
      )}
    </div>
  )
}
