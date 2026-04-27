import React from 'react';
import { useSeoCrawler } from '../../../../../contexts/SeoCrawlerContext';
import ActionPill from './ActionPill';
import TierBadge from './TierBadge';
import DeltaPill from './DeltaPill';
import { getMetric, getActions } from '../../../inspector/shared';

function safePath(url: string) {
    try { return new URL(url).pathname || '/'; } catch { return url; }
}

export default function PagePreviewRow({
    page, showAction = true,
}: { page: any; showAction?: boolean }) {
    const { setSelectedPage } = useSeoCrawler() as any;
    const path = safePath(page.url);

    // Foundation-aware action resolution
    const actions = getActions(page);
    const primary = actions[0];

    const primaryAction = primary?.title || page.recommendedAction;
    const actionKind: 'technical' | 'content' | 'industry' | 'monitor' =
        primary?.category?.toLowerCase() === 'technical' ? 'technical' :
            primary?.category?.toLowerCase() === 'content' ? 'content' :
                primary?.category?.toLowerCase() === 'industry' ? 'industry' : 'monitor';

    const pageValueTier = getMetric(page, 'pageValueTier');
    const gscClicks = getMetric(page, 'gscClicks');
    const sessionsDeltaPct = getMetric(page, 'sessionsDeltaPct');

    return (
        <button
            onClick={() => setSelectedPage(page)}
            className="w-full text-left px-3 py-2 rounded border border-[#1a1a1a] bg-[#0a0a0a] hover:bg-[#111] hover:border-[#2f2f2f] transition-colors grid grid-cols-[18px_1fr_auto_auto_auto] items-center gap-3"
        >
            <TierBadge tier={pageValueTier} compact />
            <div className="min-w-0">
                <div className="text-[12px] text-white truncate">{page.title || path}</div>
                <div className="text-[10px] text-blue-400 font-mono truncate">{path}</div>
            </div>

            {showAction && (
                <ActionPill
                    action={primaryAction}
                    kind={actionKind}
                    size="xs"
                    title={primary?.reason || page.recommendedActionReason}
                />
            )}

            <div className="text-right min-w-[62px]">
                <div className="text-[11px] text-white font-mono">
                    {Number(gscClicks || 0).toLocaleString()}
                </div>
                <div className="text-[9px] text-[#555]">clicks/30d</div>
            </div>

            <div className="min-w-[52px] text-right">
                <DeltaPill value={sessionsDeltaPct} />
            </div>
        </button>
    );
}

