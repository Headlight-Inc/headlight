import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useFaSidebarData } from '../../../../services/FaSidebarData';
import {
    Card, StackedBar, BarMini, Sparkline, EmptyHint,
    fmtNumber, type Tone,
} from '../shared';

const SEVERITY_TONE: Record<string, Tone> = {
    critical: 'bad',
    high:     'bad',
    medium:   'warn',
    low:      'info',
};

const CATEGORY_TONE: Record<string, Tone> = {
    Tech:        'info',
    Content:     'info',
    Links:       'warn',
    Schema:      'info',
    Performance: 'warn',
    A11y:        'good',
    Security:    'bad',
};

export default function FaIssuesTab() {
    const { issues } = useFaSidebarData();
    const totalIssues = issues.topIssues.reduce((s, x) => s + x.count, 0);

    if (issues.topIssues.length === 0) {
        return (
            <EmptyHint
                title="No issues found"
                sub="All checks pass on the current crawl, or the crawl has not started yet."
            />
        );
    }

    const severitySegments: Array<{ label: string; value: number; tone: Tone }> = [
        { label: 'Critical', value: issues.severitySplit.critical, tone: 'bad' },
        { label: 'High',     value: issues.severitySplit.high,     tone: 'bad' },
        { label: 'Medium',   value: issues.severitySplit.medium,   tone: 'warn' },
        { label: 'Low',      value: issues.severitySplit.low,      tone: 'info' },
    ];

    const categoryEntries = Object.entries(issues.categorySplit) as Array<[string, number]>;
    const categoryMax = Math.max(1, ...categoryEntries.map(([, v]) => v));

    const trendTone: Tone = issues.trend.length > 1
        ? (issues.trend[issues.trend.length - 1] < issues.trend[0] ? 'good' : 'bad')
        : 'info';

    return (
        <div className="space-y-3">
            <Card title="By severity">
                <StackedBar segments={severitySegments} />
            </Card>

            <Card title="By category">
                <div className="space-y-2">
                    {categoryEntries.map(([cat, count]) => (
                        <BarMini
                            key={cat}
                            label={cat}
                            value={count}
                            max={categoryMax}
                            count={count}
                            tone={CATEGORY_TONE[cat] || 'info'}
                        />
                    ))}
                </div>
            </Card>

            <Card title={`Top issues (${fmtNumber(totalIssues)})`} noPadding>
                <ul className="divide-y divide-[#222]">
                    {issues.topIssues.map((iss) => (
                        <li key={iss.id} className="flex items-center gap-2 text-[11px] py-1.5 px-2.5 hover:bg-[#1a1a1a] transition-colors cursor-pointer group">
                            <span className={`shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${
                                SEVERITY_TONE[iss.severity] === 'bad' ? 'text-red-400 bg-red-400/10 border-red-500/20' :
                                SEVERITY_TONE[iss.severity] === 'warn' ? 'text-orange-400 bg-orange-400/10 border-orange-500/20' :
                                'text-blue-400 bg-blue-400/10 border-blue-500/20'
                            }`}>{iss.severity}</span>
                            <span className="text-[#ddd] truncate flex-1 group-hover:text-white transition-colors">{iss.label}</span>
                            <span className="font-mono text-[#888] tabular-nums">{fmtNumber(iss.count)}</span>
                        </li>
                    ))}
                </ul>
            </Card>

            <Card title="Trend">
                <div className="flex items-center justify-between">
                    <Sparkline data={issues.trend} tone={trendTone} />
                    <div className="flex items-center gap-3 text-[10px]">
                        <span className="text-[#888]">Last {issues.trend.length || 0} sessions</span>
                    </div>
                </div>
                <div className="flex items-center gap-3 mt-2 text-[11px]">
                    <span className="flex items-center gap-1 text-blue-400">
                        <ArrowUpRight size={11} />
                        <span className="font-mono">{fmtNumber(issues.newCount)}</span>
                        <span className="text-[#888]">new</span>
                    </span>
                    <span className="flex items-center gap-1 text-green-400">
                        <ArrowDownRight size={11} />
                        <span className="font-mono">{fmtNumber(issues.resolvedCount)}</span>
                        <span className="text-[#888]">resolved</span>
                    </span>
                </div>
            </Card>
        </div>
    );
}
