import * as React from 'react';
import { Card, Row, SectionTitle, StatTile } from '../../shared/primitives';
import { MiniBar } from '../../shared/charts';
import { fmtInt, fmtPct } from '../../shared/format';
import type { RsTabProps } from '@/services/right-sidebar/types';
import type { WqaSiteStats } from '@/services/right-sidebar/wqa';

export function TechTab({ stats }: RsTabProps<WqaSiteStats>) {
    const speedMix = [
        { name: 'Good',    value: stats.pagesGoodSpeed, tone: '#22c55e' },
        { name: 'Needs Impr', value: Math.max(0, stats.htmlPages - stats.pagesGoodSpeed - (stats.brokenRate * stats.totalPages)), tone: '#f59e0b' },
        { name: 'Poor',    value: Math.round(stats.brokenRate * stats.totalPages), tone: '#ef4444' },
    ];

    return (
        <div className="space-y-4">
            <div className="px-3 grid grid-cols-2 gap-1.5">
                <StatTile label="Core Vitals" value="Fair" tone="warn" />
                <StatTile label="Broken pages" value={fmtInt(stats.brokenRate * stats.totalPages)} tone={stats.brokenRate > 0 ? 'bad' : 'neutral'} />
                <StatTile label="Avg Load"     value="1.2s" />
                <StatTile label="Page size"    value="420kb" />
            </div>

            <SectionTitle>Speed distribution</SectionTitle>
            <Card>
                <MiniBar data={speedMix} />
            </Card>

            <SectionTitle>Technical health</SectionTitle>
            <Card>
                <Row label="HTTPS coverage"    value="100%" tone="good" />
                <Row label="Mobile friendly"   value="98%"  tone="good" />
                <Row label="Crawl efficiency"  value="High" tone="good" />
                <Row label="Server response"   value="240ms" />
            </Card>
        </div>
    );
}
