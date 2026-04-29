import React from 'react';
import { ExternalLink, Plus, Plug } from 'lucide-react';
import { useFaSidebarData } from '../../../../services/FaSidebarData';
import { useSeoCrawler } from '../../../../contexts/SeoCrawlerContext';
import {
    Card, BarMini, EmptyHint, StatusDot,
    fmtPct, fmtRelativeTime, type Tone,
} from '../shared';

function toneForStatus(status: 'connected' | 'disconnected' | 'error'): Tone {
    if (status === 'connected') return 'good';
    if (status === 'error') return 'bad';
    return 'mute';
}

export default function FaIntegrationsTab() {
    const { integrations } = useFaSidebarData();
    const { setShowSettings } = useSeoCrawler() as any;

    return (
        <div className="space-y-3">
            <Card title="Sources" noPadding action={
                <button
                    onClick={() => setShowSettings(true)}
                    className="flex items-center gap-1 text-[10px] text-[#888] hover:text-white transition-colors mr-2"
                >
                    Manage
                    <ExternalLink size={10} />
                </button>
            }>
                <ul className="divide-y divide-[#222]">
                    {integrations.sources.map((src) => {
                        const tone = toneForStatus(src.status);
                        return (
                            <li key={`${src.id}-${src.label}`} className="flex items-center gap-2 text-[11px] py-1.5 px-2.5">
                                <StatusDot tone={tone} />
                                <span className="text-[#ddd] truncate flex-1">{src.label}</span>
                                <span className="font-mono text-[#888] tabular-nums">{fmtRelativeTime(src.lastSyncAt)}</span>
                            </li>
                        );
                    })}
                </ul>
            </Card>

            <Card title="Page coverage">
                <div className="space-y-2">
                    {integrations.sources
                        .filter((s) => s.status === 'connected' && s.coveragePct > 0)
                        .map((s) => (
                            <BarMini
                                key={`cov-${s.id}-${s.label}`}
                                label={s.label}
                                value={Math.round(s.coveragePct * 100)}
                                max={100}
                                count={Number(fmtPct(s.coveragePct, 0).replace('%', ''))}
                                tone={s.coveragePct > 0.6 ? 'good' : s.coveragePct > 0.2 ? 'warn' : 'bad'}
                            />
                        ))}
                    {integrations.sources.every((s) => s.coveragePct === 0) && (
                        <div className="text-[11px] text-[#666]">Coverage will populate after sources sync data.</div>
                    )}
                </div>
            </Card>

            <Card title="Data freshness">
                <ul className="space-y-1">
                    {integrations.freshness.map((f) => (
                        <li key={`fresh-${f.id}-${f.label}`} className="flex items-center justify-between text-[11px]">
                            <span className="text-[#aaa]">{f.label}</span>
                            <span className="font-mono text-[#888]">{f.window}</span>
                        </li>
                    ))}
                </ul>
            </Card>

            <Card title="Missing adapters" noPadding={integrations.missingAdapters.length > 0}>
                {integrations.missingAdapters.length === 0 ? (
                    <EmptyHint icon={<Plug size={18} />} title="All adapters present" sub="Nothing recommended for the current industry." />
                ) : (
                    <ul className="divide-y divide-[#222]">
                        {integrations.missingAdapters.map((m) => (
                            <li key={m.id} className="flex items-start gap-2 text-[11px] p-2.5 hover:bg-[#1a1a1a] transition-colors">
                                <Plus size={12} className="text-[#666] mt-0.5" />
                                <div className="flex-1">
                                    <div className="text-[#ddd]">{m.label}</div>
                                    <div className="text-[10px] text-[#666] leading-snug mt-0.5">{m.reason}</div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </Card>
        </div>
    );
}
