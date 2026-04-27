import React from 'react';
import type { DetectedIndustry } from '../../../../services/SiteTypeDetector';
import type { WqaIndustryStats } from '../../../../services/WebsiteQualityModeTypes';
import { Row, SectionTitle, fmtPct, fmtInt } from './shared';

type KpiRow = { label: string; value: string; tone?: 'good' | 'warn' | 'bad' | 'neutral'; hint?: string };

function pctTone(v: number, goodAt = 80, warnAt = 50): 'good' | 'warn' | 'bad' {
    if (v >= goodAt) return 'good';
    if (v >= warnAt) return 'warn';
    return 'bad';
}

function rowsFor(industry: DetectedIndustry, s: WqaIndustryStats | null): KpiRow[] {
    if (!s) return [];
    switch (industry) {
        case 'ecommerce': return [
            { label: 'Product schema',  value: fmtPct(s.productSchemaCoverage || 0, 1), tone: pctTone(s.productSchemaCoverage || 0) },
            { label: 'Review schema',   value: fmtPct(s.reviewSchemaCoverage  || 0, 1), tone: pctTone(s.reviewSchemaCoverage  || 0, 50, 20) },
            { label: 'Breadcrumb',      value: fmtPct(s.breadcrumbCoverage    || 0, 1), tone: pctTone(s.breadcrumbCoverage    || 0) },
            { label: 'OOS indexed',     value: fmtInt(s.outOfStockIndexed     || 0), tone: (s.outOfStockIndexed || 0) > 0 ? 'warn' : 'good' },
        ];
        case 'news':
        case 'blog': return [
            { label: 'Article schema',  value: fmtPct(s.articleSchemaCoverage || 0, 1), tone: pctTone(s.articleSchemaCoverage || 0) },
            { label: 'Author byline',   value: fmtPct(s.authorAttributionRate || 0, 1), tone: pctTone(s.authorAttributionRate || 0) },
            { label: 'Publish date',    value: fmtPct(s.publishDateRate       || 0, 1), tone: pctTone(s.publishDateRate       || 0) },
            { label: 'News sitemap',    value: fmtPct(s.newsSitemapCoverage   || 0, 1), tone: (s.newsSitemapCoverage || 0) > 0 ? 'good' : 'warn', hint: 'Google News' },
        ];
        case 'local': return [
            { label: 'LocalBusiness schema', value: s.hasLocalSchema ? 'Yes' : 'No', tone: s.hasLocalSchema ? 'good' : 'bad' },
            { label: 'NAP consistent',       value: s.napConsistent  ? 'Yes' : 'No', tone: s.napConsistent  ? 'good' : 'warn' },
            { label: 'GMB link',             value: s.hasGmbLink     ? 'Yes' : 'No', tone: s.hasGmbLink     ? 'good' : 'warn' },
            { label: 'Service-area pages',   value: fmtInt(s.serviceAreaPageCount || 0) },
        ];
        case 'saas': return [
            { label: 'Pricing page',   value: s.hasPricingPage   ? 'Yes' : 'No', tone: s.hasPricingPage   ? 'good' : 'warn' },
            { label: 'Docs section',   value: s.hasDocsSection   ? 'Yes' : 'No', tone: s.hasDocsSection   ? 'good' : 'warn' },
            { label: 'Changelog',      value: s.hasChangelog     ? 'Yes' : 'No', tone: s.hasChangelog     ? 'good' : 'neutral' },
            { label: 'Comparison pages', value: s.hasComparisonPages ? 'Yes' : 'No', tone: s.hasComparisonPages ? 'good' : 'neutral' },
        ];
        case 'healthcare': return [
            { label: 'Medical author',     value: fmtPct(s.medicalAuthorRate     || 0, 1), tone: pctTone(s.medicalAuthorRate || 0) },
            { label: 'Reviewed by',        value: fmtPct(s.medicalReviewRate     || 0, 1), tone: pctTone(s.medicalReviewRate || 0, 50, 20) },
            { label: 'Medical disclaimer', value: fmtPct(s.medicalDisclaimerRate || 0, 1), tone: pctTone(s.medicalDisclaimerRate || 0) },
        ];
        case 'finance': return [
            { label: 'Financial disclaimer', value: fmtPct(s.financialDisclaimerRate || 0, 1), tone: pctTone(s.financialDisclaimerRate || 0) },
            { label: 'Author credentials',   value: fmtPct(s.authorCredentialsRate   || 0, 1), tone: pctTone(s.authorCredentialsRate   || 0) },
        ];
        case 'realEstate': return [
            { label: 'Listings',      value: fmtInt(s.listingCount || 0) },
            { label: 'Price markup',  value: fmtPct(s.priceMarkupCoverage || 0, 1), tone: pctTone(s.priceMarkupCoverage || 0) },
        ];
        case 'restaurant': return [
            { label: 'Menu schema',     value: s.hasMenuSchema      ? 'Yes' : 'No', tone: s.hasMenuSchema      ? 'good' : 'warn' },
            { label: 'Reservation link',value: s.hasReservationLink ? 'Yes' : 'No', tone: s.hasReservationLink ? 'good' : 'warn' },
        ];
        default: return [];
    }
}

export default function IndustryKpiStrip({ industry, stats }: {
    industry: DetectedIndustry;
    stats: WqaIndustryStats | null;
}) {
    const rows = rowsFor(industry, stats);
    if (!rows.length) return null;
    return (
        <div>
            <SectionTitle title={`${industry} KPIs`} hint="industry-specific" />
            <div className="space-y-0.5">
                {rows.map((r) => <Row key={r.label} label={r.label} value={r.value} tone={r.tone} hint={r.hint} />)}
            </div>
        </div>
    );
}
