import React from 'react';
import { DataRow, IndustryActionBlock, SectionHeader, StatusBadge } from './_helpers';

export default function MediaView({ page }: { page: any }) {
  const sig = page?.industrySignals || {};
  return (
    <div>
      <IndustryActionBlock page={page} />
      <SectionHeader title="News & feed signals" />
      <div className="flex flex-wrap gap-2 mb-5">
        <StatusBadge status={sig.headlineLength ? 'pass' : 'info'} label={`Headline ${sig.headlineLength || '—'}`} />
        <StatusBadge status={sig.hasAuthorByline ? 'pass' : 'warn'} label="Byline" />
        <StatusBadge status={sig.hasTimeTag ? 'pass' : 'warn'} label="Publish date schema" />
        <StatusBadge status={(page?.schemaTypes || []).includes('NewsArticle') ? 'pass' : 'warn'} label="NewsArticle schema" />
        <StatusBadge status={sig.inNewsSitemap ? 'pass' : 'info'} label="News sitemap" />
      </div>
      <SectionHeader title="Engagement" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
        <DataRow label="Avg engagement time" value={page?.ga4EngagementTimePerPage} />
        <DataRow label="Scroll depth" value={page?.scrollDepth} />
        <DataRow label="Bounce rate" value={page?.ga4BounceRate} />
      </div>
    </div>
  );
}
