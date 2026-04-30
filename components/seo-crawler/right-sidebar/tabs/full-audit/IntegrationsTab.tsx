import React from 'react'
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'
import { useSeoCrawler } from '../../../../../contexts/SeoCrawlerContext'
import { Card } from '../../primitives/Card'
import { Waffle } from '../../primitives/Waffle'
import { useFullAuditRsData } from '../../selectors/useFullAuditRsData'

const ago = (iso: string | null) => {
    if (!iso) return '—'
    const ms = Date.now() - new Date(iso).getTime()
    if (ms < 60_000)         return 'just now'
    if (ms < 60 * 60_000)    return `${Math.round(ms / 60_000)}m ago`
    if (ms < 24 * 60 * 60_000) return `${Math.round(ms / (60 * 60_000))}h ago`
    return `${Math.round(ms / (24 * 60 * 60_000))}d ago`
}

const StatusIcon = ({ s }: { s: 'connected' | 'disconnected' | 'error' }) =>
    s === 'connected' ? <CheckCircle2 size={12} className="text-emerald-400" />
    : s === 'error'   ? <AlertTriangle size={12} className="text-amber-400" />
    : <XCircle size={12} className="text-[#555]" />

const Row = ({ name, status, last, onConnect }: {
    name: string
    status: 'connected' | 'disconnected' | 'error'
    last?: string | null
    onConnect?: () => void
}) => (
    <div className="flex items-center justify-between py-1.5 border-b border-[#161616] last:border-b-0">
        <span className="flex items-center gap-2 text-[11px] text-[#ddd]"><StatusIcon s={status} />{name}</span>
        {status === 'connected'
            ? <span className="text-[10px] text-[#777]">{ago(last || null)}</span>
            : (
                <button
                    onClick={onConnect}
                    className="text-[10px] font-bold text-[#F5364E] hover:text-white px-1.5 py-0.5 rounded border border-[#222] hover:border-[#F5364E]/30"
                >
                    {status === 'error' ? 'Reconnect' : 'Connect'}
                </button>
            )}
    </div>
)

export default function IntegrationsTab() {
    const d = useFullAuditRsData()
    const { setSettingsTab } = useSeoCrawler() as any

    const open = (tab: string) => () => setSettingsTab?.(tab)

    return (
        <div className="px-2.5 pt-2.5 pb-6">
            <Card title="Sources">
                <Row name="Google Search Console" status={d.integrations.gsc}        last={d.integrations.freshness.gsc}       onConnect={open('integrations')} />
                <Row name="Google Analytics 4"    status={d.integrations.ga4}        last={d.integrations.freshness.ga4}       onConnect={open('integrations')} />
                <Row name="Bing Webmaster Tools"  status={d.integrations.bing}        onConnect={open('integrations')} />
                <Row name="Google Business Profile" status={d.integrations.gbp}       onConnect={open('integrations')} />
                <Row name="Backlink provider"     status={d.integrations.backlinks}  last={d.integrations.freshness.backlinks} onConnect={open('integrations')} />
                <Row name="Keyword data"          status={d.integrations.keywords}    onConnect={open('integrations')} />
            </Card>

            <Card title="Coverage">
                <div className="grid grid-cols-3 gap-3">
                    <Waffle filled={d.integrations.coverage.gscPct} total={100} label="GSC pages" />
                    <Waffle filled={d.integrations.coverage.kwPct}  total={100} label="Keyword data" />
                    <Waffle filled={d.integrations.coverage.blPct}  total={100} label="Backlink data" />
                </div>
            </Card>

            <Card title="Open settings">
                <button
                    onClick={open('integrations')}
                    className="w-full text-[11px] font-bold text-white bg-[#F5364E] hover:bg-[#df3248] rounded px-3 py-1.5"
                >
                    Manage integrations
                </button>
            </Card>
        </div>
    )
}
