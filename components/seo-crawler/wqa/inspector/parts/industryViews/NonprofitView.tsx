import React from 'react';
import { DataRow, IndustryActionBlock, SectionHeader, StatusBadge } from './_helpers';

export default function NonprofitView({ page }: { page: any }) {
  const sig = page?.industrySignals || {};
  return (
    <div>
      <IndustryActionBlock page={page} />
      <SectionHeader title="Donate flow" />
      <div className="flex flex-wrap gap-2 mb-5">
        <StatusBadge status={sig.donateCtaVisible ? 'pass' : 'warn'} label="Donate CTA visible" />
        <StatusBadge status={sig.oneClickGiving ? 'pass' : 'info'} label="One-click giving" />
        <StatusBadge status={sig.einSchema ? 'pass' : 'info'} label="EIN / 501(c)(3) schema" />
      </div>
      <SectionHeader title="Transparency" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
        <DataRow label="Annual report linked" value={sig.annualReportLinked ? 'Yes' : 'No'} />
        <DataRow label="Financials linked" value={sig.financialsLinked ? 'Yes' : 'No'} />
        <DataRow label="Impact metrics shown" value={sig.impactMetricsShown ? 'Yes' : 'No'} />
      </div>
    </div>
  );
}
