import * as React from 'react';
import { useSeoCrawler } from '@/contexts/SeoCrawlerContext';
import { Card, Row, SectionTitle, StatTile } from '../../shared/primitives';
import { MiniBar } from '../../shared/charts';
import { fmtInt, fmtPct } from '../../shared/format';
import type { RsTabProps } from '@/services/right-sidebar/types';
import type { WqaSiteStats } from '@/services/right-sidebar/wqa';

export function ContentTab({ stats }: RsTabProps<WqaSiteStats>) {
    const { wqaFacets } = useSeoCrawler();

    const qualityMix = [
        { name: 'High',   value: stats.radarContent, tone: '#22c55e' },
        { name: 'Medium', value: 50,                 tone: '#3b82f6' },
        { name: 'Low',    value: 30,                 tone: '#ef4444' },
    ];

    return (
        <div className="space-y-4">
            <div className="px-3 grid grid-cols-2 gap-1.5">
                <StatTile label="Content Score" value={Math.round(stats.radarContent)} tone="accent" />
                <StatTile label="Thin pages"    value={fmtInt(stats.thinContentRate * stats.totalPages)} tone={stats.thinContentRate > 0.1 ? 'warn' : 'neutral'} />
                <StatTile label="Duplicates"    value={fmtInt(stats.duplicateRate * stats.totalPages)}   tone={stats.duplicateRate > 0.05 ? 'bad' : 'neutral'} />
                <StatTile label="Schema cov."   value={fmtPct(stats.schemaCoverage)} />
            </div>

            <SectionTitle>Content quality mix</SectionTitle>
            <Card>
                <MiniBar data={qualityMix} />
            </Card>

            <SectionTitle>Technical content signals</SectionTitle>
            <Card>
                <Row label="Readability (avg)" value="Good" tone="good" />
                <Row label="Word count (avg)"  value="1,240" />
                <Row label="Heading hierarchy" value="92%" tone="good" />
                <Row label="Broken images"     value="12" tone="warn" />
            </Card>
        </div>
    );
}
