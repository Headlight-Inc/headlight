import React from 'react';
import { DataRow, IndustryActionBlock, SectionHeader, StatusBadge } from './_helpers';

export default function GovernmentView({ page }: { page: any }) {
  const sig = page?.industrySignals || {};
  return (
    <div>
      <IndustryActionBlock page={page} />
      <SectionHeader title="Accessibility" />
      <div className="flex flex-wrap gap-2 mb-5">
        <StatusBadge status={sig.wcagAA ? 'pass' : 'info'} label="WCAG AA" />
        <StatusBadge status={page?.missingAltImages ? 'warn' : 'pass'} label="Alt-text rate" />
        <StatusBadge status={page?.readability ? 'pass' : 'info'} label="Plain language score" />
        <StatusBadge status={page?.hreflang ? 'pass' : 'warn'} label="hreflang" />
      </div>
      <SectionHeader title="Civic signals" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
        <DataRow label="Citation density" value={sig.citationDensity} />
        <DataRow label="Public records linked" value={sig.publicRecordsLinked ? 'Yes' : 'No'} />
        <DataRow label="Last reviewed date" value={sig.lastReviewedDate || page?.lastModified} />
      </div>
    </div>
  );
}
