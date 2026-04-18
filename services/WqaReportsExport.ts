import type { WqaSiteStats, WqaActionGroup } from './WebsiteQualityModeTypes';
import type { WqaFacets } from './WqaFilterEngine';
import { formatCat } from '../components/seo-crawler/wqa/wqaUtils';

interface Args {
    pages: any[];
    stats: WqaSiteStats;
    facets: WqaFacets;
    actions: WqaActionGroup[];
    industry: string;
}

export async function exportReportsPDF({ pages, stats, facets, actions, industry }: Args): Promise<void> {
    const [{ default: jsPDF }, autoTableModule] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable'),
    ]);
    const autoTable = autoTableModule.default;

    const doc      = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageW    = doc.internal.pageSize.getWidth();
    const pageH    = doc.internal.pageSize.getHeight();
    const margin   = 40;
    let y          = 64;

    const bg = () => { doc.setFillColor(10, 10, 11); doc.rect(0, 0, pageW, pageH, 'F'); };
    const section = (title: string) => {
        if (y > pageH - 80) { doc.addPage(); bg(); y = 64; }
        doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.setTextColor(245, 54, 78);
        doc.text(title, margin, y); y += 16;
    };

    bg();
    doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(22);
    doc.text('Website Quality Report', margin, y); y += 26;
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(170, 170, 170);
    doc.text(`Pages: ${pages.length.toLocaleString()}  ·  Industry: ${industry}  ·  Generated ${new Date().toLocaleDateString()}`, margin, y);
    y += 22;

    // KPIs
    section('Headline metrics');
    autoTable(doc, {
        startY: y, theme: 'grid',
        head: [['Metric', 'Value']],
        body: [
            ['Total pages',            pages.length.toLocaleString()],
            ['Indexed',                stats.indexedPages.toLocaleString()],
            ['Impressions (GSC)',      stats.totalImpressions.toLocaleString()],
            ['Clicks (GSC)',           stats.totalClicks.toLocaleString()],
            ['Sessions (GA4)',         stats.totalSessions.toLocaleString()],
            ['Avg position',           stats.avgPosition.toFixed(1)],
            ['Avg CTR',                `${stats.avgCtr}%`],
            ['Avg health score',       Math.round(stats.avgHealthScore).toString()],
            ['Decay risk pages',       String(stats.decayRiskCount)],
            ['Losing traffic',         String(stats.pagesLosingTraffic)],
            ['Striking distance',      String(stats.pagesInStrikingDistance)],
            ['Cannibalization',        String(stats.cannibalizationCount)],
            ['Total estimated impact', Math.round(stats.totalEstimatedImpact).toLocaleString()],
        ],
        styles: { fillColor: [17, 17, 17], textColor: [230, 230, 230], lineColor: [34, 34, 34] },
        headStyles: { fillColor: [24, 24, 24], textColor: [245, 54, 78] },
        margin: { left: margin, right: margin },
    });
    y = (doc as any).lastAutoTable.finalY + 20;

    // Coverage
    section('Coverage');
    autoTable(doc, {
        startY: y, theme: 'grid',
        head: [['Area', 'Coverage']],
        body: [
            ['Sitemap',           `${Math.round(stats.sitemapCoverage)}%`],
            ['Schema',            `${Math.round(stats.schemaCoverage)}%`],
            ['Broken (lower=better)',   `${Math.round(stats.brokenRate)}%`],
            ['Orphans (lower=better)',  `${Math.round(stats.orphanRate)}%`],
            ['Duplicates (lower=better)', `${Math.round(stats.duplicateRate)}%`],
            ['Thin content (lower=better)', `${Math.round(stats.thinContentRate)}%`],
        ],
        styles: { fillColor: [17, 17, 17], textColor: [230, 230, 230], lineColor: [34, 34, 34] },
        headStyles: { fillColor: [24, 24, 24], textColor: [245, 54, 78] },
        margin: { left: margin, right: margin },
    });
    y = (doc as any).lastAutoTable.finalY + 20;

    // Distribution
    section('Distribution');
    const dist: Array<[string, string, number]> = [];
    Object.entries(facets.searchStatuses).forEach(([k, v]) => dist.push(['Search position', k,   v]));
    Object.entries(facets.trafficStatuses).forEach(([k, v]) => dist.push(['Traffic trend',   k,   v]));
    Object.entries(facets.valueTiers).forEach    (([k, v]) => dist.push(['Value tier',      k,   v]));
    Object.entries(facets.contentAges).forEach   (([k, v]) => dist.push(['Content age',     k,   v]));
    Object.entries(facets.indexabilities).forEach(([k, v]) => dist.push(['Indexability',    k,   v]));
    autoTable(doc, {
        startY: y, theme: 'grid',
        head: [['Dimension', 'Bucket', 'Pages']],
        body: dist.map(([a, b, c]) => [a, b, String(c)]),
        styles: { fillColor: [17, 17, 17], textColor: [230, 230, 230], lineColor: [34, 34, 34] },
        headStyles: { fillColor: [24, 24, 24], textColor: [245, 54, 78] },
        margin: { left: margin, right: margin },
    });
    y = (doc as any).lastAutoTable.finalY + 20;

    // Pages by category
    section('Pages by category');
    autoTable(doc, {
        startY: y, theme: 'grid',
        head: [['Category', 'Pages']],
        body: Object.entries(stats.pagesByCategory || {})
            .sort((a, b) => Number(b[1]) - Number(a[1]))
            .map(([k, v]) => [formatCat(k), String(v)]),
        styles: { fillColor: [17, 17, 17], textColor: [230, 230, 230], lineColor: [34, 34, 34] },
        headStyles: { fillColor: [24, 24, 24], textColor: [245, 54, 78] },
        margin: { left: margin, right: margin },
    });
    y = (doc as any).lastAutoTable.finalY + 20;

    // Top actions
    section('Top actions by estimated impact');
    const sorted = [...actions].sort((a, b) => b.totalEstimatedImpact - a.totalEstimatedImpact).slice(0, 20);
    autoTable(doc, {
        startY: y, theme: 'grid',
        head: [['Category', 'Action', 'Pages', 'Est. impact', 'Effort']],
        body: sorted.map(a => [a.category, a.action, String(a.pageCount), Math.round(a.totalEstimatedImpact).toLocaleString(), a.effort]),
        styles: { fillColor: [17, 17, 17], textColor: [230, 230, 230], lineColor: [34, 34, 34] },
        headStyles: { fillColor: [24, 24, 24], textColor: [245, 54, 78] },
        margin: { left: margin, right: margin },
    });

    doc.save(`wqa-report-${new Date().toISOString().split('T')[0]}.pdf`);
}
