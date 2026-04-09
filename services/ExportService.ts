import { ALL_COLUMNS } from '../components/seo-crawler/constants';

export type ExportFormat = 'csv' | 'json' | 'pdf' | 'google-sheets' | 'excel';
export type ExportScope = 'all' | 'filtered' | 'issues' | 'selected';

export interface ColumnDef {
    key: string;
    label: string;
    group?: string;
}

export interface ExportColumnOptions {
    includeVisibleColumns: boolean;
    includeAiAnalysis: boolean;
    includeIntegrations: boolean;
    includeRawHtml: boolean;
}

export interface PdfExportOptions {
    executiveSummary: boolean;
    issueBreakdownCharts: boolean;
    pageLevelDetails: boolean;
    recommendations: boolean;
    comparisonWithPreviousCrawl: boolean;
    whiteLabel: boolean;
    companyLogo?: string | null;
}

export interface ExportOptions {
    crawlUrl?: string;
    selectedUrls?: string[];
    visibleColumns?: string[];
    columnOptions?: ExportColumnOptions;
    pdfOptions?: PdfExportOptions;
    stats?: Record<string, any>;
    healthScore?: { score: number; grade: string };
    auditInsights?: any[];
    strategicOpportunities?: any[];
    diffResult?: any | null;
    issueResolver?: (page: any) => Array<{ id: string; label: string; type: 'error' | 'warning' | 'notice' }>;
  }

const AI_KEYS = [
    'topicCluster',
    'searchIntent',
    'strategicPriority',
    'contentDecay',
    'summary',
    'aiSummary',
    'recommendedAction',
    'opportunityScore',
    'businessValueScore'
];

const INTEGRATION_KEYS = [
    'gscClicks',
    'gscImpressions',
    'gscCtr',
    'gscPosition',
    'ga4Views',
    'ga4Sessions',
    'ga4BounceRate',
    'ga4Conversions',
    'authorityScore',
    'urlRating',
    'referringDomains'
];

const RAW_HTML_KEYS = ['html', 'renderedHtml', 'rawHtml', 'source'];

const ISSUE_FALLBACK = (page: any) => {
    const issues = Number(page?.issueCount || 0);
    return Number.isFinite(issues) && issues > 0 ? new Array(issues).fill({ type: 'warning' }) : [];
};

const csvEscape = (value: any) => {
    if (value === null || value === undefined) return '""';
    const normalized = typeof value === 'object' ? JSON.stringify(value) : String(value);
    return `"${normalized.replace(/"/g, '""')}"`;
};

const isStructuredDataPage = (page: any) => {
    const schema = Array.isArray(page?.schema) ? page.schema : [];
    const schemaTypes = Array.isArray(page?.schemaTypes) ? page.schemaTypes : [];
    return schema.length > 0 || schemaTypes.length > 0;
};

const formatDuration = (value: number) => {
    if (!Number.isFinite(value) || value <= 0) return '0s';
    if (value < 1000) return `${Math.round(value)}ms`;
    return `${(value / 1000).toFixed(2)}s`;
};

const getColumnDefinitions = (visibleColumns?: string[], columnOptions?: ExportColumnOptions) => {
    let columns = ALL_COLUMNS.filter((column) => !visibleColumns || visibleColumns.includes(column.key));

    if (!columnOptions?.includeAiAnalysis) {
        columns = columns.filter((column) => !AI_KEYS.includes(column.key));
    }

    if (!columnOptions?.includeIntegrations) {
        columns = columns.filter((column) => !INTEGRATION_KEYS.includes(column.key));
    }

    if (!columnOptions?.includeRawHtml) {
        columns = columns.filter((column) => !RAW_HTML_KEYS.includes(column.key));
    }

    return columns;
};

export const filterPagesForScope = (
    pages: any[],
    scope: ExportScope,
    options: ExportOptions = {}
) => {
    const issueResolver = options.issueResolver || ISSUE_FALLBACK;

    if (scope === 'issues') {
        return pages.filter((page) => issueResolver(page).length > 0);
    }

    if (scope === 'selected') {
        const selected = new Set(options.selectedUrls || []);
        return pages.filter((page) => selected.has(page.url));
    }

    return pages;
};

export function exportCSV(
    pages: any[],
    scope: ExportScope,
    options: ExportOptions = {}
): Blob {
    const scopedPages = filterPagesForScope(pages, scope, options);
    const columns = getColumnDefinitions(options.visibleColumns, options.columnOptions);
    const headers = columns.map((column) => column.label).join(',');
    const rows = scopedPages.map((page) => columns.map((column) => csvEscape(page[column.key])).join(','));
    return new Blob([headers + '\n', ...rows.map((row) => row + '\n')], { type: 'text/csv;charset=utf-8' });
}

export function exportComparisonCSV(diffResult: any): Blob {
    const rows: string[] = [];
    const headers = ['url', 'changeType', 'field', 'oldValue', 'newValue'];

    for (const page of diffResult?.added || []) {
        rows.push([page.url, 'added', '', '', ''].map(csvEscape).join(','));
    }

    for (const page of diffResult?.removed || []) {
        rows.push([page.url, 'removed', '', '', ''].map(csvEscape).join(','));
    }

    for (const change of diffResult?.changed || []) {
        for (const fieldChange of change.fieldChanges || []) {
            rows.push([
                change.url,
                'changed',
                fieldChange.field,
                fieldChange.oldValue,
                fieldChange.newValue
            ].map(csvEscape).join(','));
        }
    }

    for (const fixed of diffResult?.issuesFixed || []) {
        for (const issue of fixed.issues || []) {
            rows.push([fixed.url, 'issue_fixed', issue.label, 'true', 'false'].map(csvEscape).join(','));
        }
    }

    for (const issueEntry of diffResult?.newIssues || []) {
        for (const issue of issueEntry.issues || []) {
            rows.push([issueEntry.url, 'issue_added', issue.label, 'false', 'true'].map(csvEscape).join(','));
        }
    }

    return new Blob([headers.join(',') + '\n', ...rows.map((row) => row + '\n')], { type: 'text/csv;charset=utf-8' });
}

export function exportJSON(
    pages: any[],
    scope: ExportScope,
    options: ExportOptions = {}
): Blob {
    const scopedPages = filterPagesForScope(pages, scope, options);
    const issueResolver = options.issueResolver || ISSUE_FALLBACK;
    const dump = {
        meta: {
            exportedAt: new Date().toISOString(),
            totalPages: scopedPages.length,
            crawlUrl: options.crawlUrl || null,
            scope
        },
        summary: {
            healthScore: options.healthScore || null,
            stats: options.stats || null,
            diffResult: options.diffResult || null
        },
        pages: scopedPages,
        issues: scopedPages.map((page) => ({
            url: page.url,
            issues: issueResolver(page)
        })).filter((page) => page.issues.length > 0)
    };

    return new Blob([JSON.stringify(dump, null, 2)], { type: 'application/json;charset=utf-8' });
}

export async function exportExcel(
    pages: any[],
    scope: ExportScope,
    options: ExportOptions = {}
): Promise<Blob> {
    const scopedPages = filterPagesForScope(pages, scope, options);
    const columns = getColumnDefinitions(options.visibleColumns, options.columnOptions);
    const XLSX = await import('xlsx');
    const worksheet = XLSX.utils.json_to_sheet(
        scopedPages.map((page) => Object.fromEntries(columns.map((column) => [column.label, page[column.key] ?? ''])))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Crawl Data');
    const buffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
    return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

export async function exportToGoogleSheets(
    pages: any[],
    scope: ExportScope,
    accessToken: string,
    options: ExportOptions = {}
): Promise<string> {
    const scopedPages = filterPagesForScope(pages, scope, options);
    const columns = getColumnDefinitions(options.visibleColumns, options.columnOptions);
    const headerRow = columns.map((column) => column.label);
    const valueRows = scopedPages.map((page) => columns.map((column) => page[column.key] ?? ''));

    const createResponse = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            properties: {
                title: `Headlight Crawl Export ${new Date().toISOString().slice(0, 10)}`
            },
            sheets: [{ properties: { title: 'Crawl Data' } }]
        })
    });

    if (!createResponse.ok) {
        throw new Error(`Failed to create spreadsheet (${createResponse.status})`);
    }

    const spreadsheet = await createResponse.json();
    const spreadsheetId = spreadsheet.spreadsheetId;

    const valuesResponse = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Crawl%20Data!A1:append?valueInputOption=RAW`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            values: [headerRow, ...valueRows]
        })
    });

    if (!valuesResponse.ok) {
        throw new Error(`Failed to populate spreadsheet (${valuesResponse.status})`);
    }

    return spreadsheet.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;
}

export async function exportPDF(
    pages: any[],
    scope: ExportScope,
    options: ExportOptions = {}
): Promise<Blob> {
    const scopedPages = filterPagesForScope(pages, scope, options);
    const pdfOptions = options.pdfOptions;
    const [{ default: jsPDF }, autoTableModule] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable')
    ]);
    const autoTable = autoTableModule.default;
    const issueResolver = options.issueResolver || ISSUE_FALLBACK;
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const marginX = 48;
    let cursorY = 64;

    const drawSectionTitle = (title: string) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(245, 54, 78);
        doc.text(title, marginX, cursorY);
        cursorY += 18;
    };

    doc.setFillColor(10, 10, 11);
    doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), 'F');
    if (pdfOptions?.companyLogo) {
        try {
            doc.addImage(pdfOptions.companyLogo, 'PNG', pageWidth - 120, 40, 56, 56);
        } catch {
            // Ignore invalid logo payloads and continue export.
        }
    }
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.text(pdfOptions?.whiteLabel ? 'SEO Crawl Report' : 'Headlight SEO Crawl Report', marginX, cursorY);
    cursorY += 28;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(170, 170, 170);
    doc.text(options.crawlUrl || 'Website crawl export', marginX, cursorY);
    cursorY += 18;
    doc.text(`Generated ${new Date().toLocaleString()}`, marginX, cursorY);
    cursorY += 26;

    if (options.healthScore) {
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(30);
        doc.text(`${options.healthScore.score}/100`, marginX, cursorY + 18);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`Overall health grade ${options.healthScore.grade}`, marginX + 120, cursorY + 18);
        cursorY += 56;
    }

    if (pdfOptions?.executiveSummary !== false) {
        drawSectionTitle('Executive Summary');
        doc.setTextColor(204, 204, 204);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        const summaryText = [
            `${scopedPages.length} pages exported in ${scope} scope.`,
            options.stats ? `${options.stats.broken || 0} broken pages, ${options.stats.redirects || 0} redirects, ${options.stats.html || 0} HTML pages.` : null,
            options.auditInsights?.length ? `Top focus: ${options.auditInsights.slice(0, 3).map((item) => item.label).join(', ')}.` : null
        ].filter(Boolean).join(' ');
        const lines = doc.splitTextToSize(summaryText || 'No crawl summary available.', pageWidth - (marginX * 2));
        doc.text(lines, marginX, cursorY);
        cursorY += (lines.length * 14) + 18;
    }

    if (pdfOptions?.issueBreakdownCharts !== false) {
        const issueCounts = scopedPages.reduce((acc, page) => {
            for (const issue of issueResolver(page)) {
                acc[issue.type] = (acc[issue.type] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);

        drawSectionTitle('Issue Breakdown');
        autoTable(doc, {
            startY: cursorY,
            theme: 'grid',
            head: [['Severity', 'Count']],
            body: [
                ['Critical', issueCounts.error || 0],
                ['Warnings', issueCounts.warning || 0],
                ['Notices', issueCounts.notice || 0],
                ['Pages With Schema', scopedPages.filter((page) => isStructuredDataPage(page)).length],
                ['Avg LCP', formatDuration(scopedPages.reduce((sum, page) => sum + Number(page?.lcp || 0), 0) / Math.max(scopedPages.length, 1))]
            ],
            styles: { fillColor: [17, 17, 17], textColor: [230, 230, 230], lineColor: [34, 34, 34] },
            headStyles: { fillColor: [24, 24, 24], textColor: [245, 54, 78] },
            margin: { left: marginX, right: marginX }
        });
        cursorY = (doc as any).lastAutoTable.finalY + 24;
    }

    if (pdfOptions?.recommendations !== false && options.auditInsights?.length) {
        drawSectionTitle('Top Recommendations');
        autoTable(doc, {
            startY: cursorY,
            theme: 'grid',
            head: [['Priority', 'Recommendation', 'Summary']],
            body: options.auditInsights.slice(0, 20).map((item) => [item.impact || 'Medium', item.label || 'Issue', item.summary || '']) ,
            styles: { fillColor: [17, 17, 17], textColor: [230, 230, 230], lineColor: [34, 34, 34], fontSize: 9 },
            headStyles: { fillColor: [24, 24, 24], textColor: [245, 54, 78] },
            margin: { left: marginX, right: marginX }
        });
        cursorY = (doc as any).lastAutoTable.finalY + 24;
    }

    if (pdfOptions?.comparisonWithPreviousCrawl && options.diffResult) {
        if (cursorY > 650) {
            doc.addPage();
            cursorY = 56;
        }
        drawSectionTitle('Comparison Snapshot');
        autoTable(doc, {
            startY: cursorY,
            theme: 'grid',
            head: [['Bucket', 'Count']],
            body: [
                ['Added pages', options.diffResult.added?.length || 0],
                ['Removed pages', options.diffResult.removed?.length || 0],
                ['Changed pages', options.diffResult.changed?.length || 0],
                ['Issues fixed', options.diffResult.issuesFixed?.length || 0],
                ['New issues', options.diffResult.newIssues?.length || 0]
            ],
            styles: { fillColor: [17, 17, 17], textColor: [230, 230, 230], lineColor: [34, 34, 34] },
            headStyles: { fillColor: [24, 24, 24], textColor: [245, 54, 78] },
            margin: { left: marginX, right: marginX }
        });
        cursorY = (doc as any).lastAutoTable.finalY + 24;
    }

    if (pdfOptions?.pageLevelDetails !== false) {
        doc.addPage();
        drawSectionTitle('Page Details');
        autoTable(doc, {
            startY: cursorY,
            theme: 'grid',
            head: [['URL', 'Status', 'Health', 'LCP', 'Issues']],
            body: scopedPages.slice(0, 250).map((page) => [
                page.url,
                page.statusCode ?? '',
                page.healthScore ?? '',
                formatDuration(Number(page?.lcp || 0)),
                issueResolver(page).map((issue) => issue.label).slice(0, 3).join(', ')
            ]),
            styles: { fillColor: [17, 17, 17], textColor: [230, 230, 230], lineColor: [34, 34, 34], fontSize: 8, overflow: 'linebreak' },
            headStyles: { fillColor: [24, 24, 24], textColor: [245, 54, 78] },
            margin: { left: marginX, right: marginX },
            columnStyles: { 0: { cellWidth: 250 } }
        });
    }

    return doc.output('blob');
}

export function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
