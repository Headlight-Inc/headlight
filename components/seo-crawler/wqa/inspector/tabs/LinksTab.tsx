import React from 'react';
import {
  DataRow, MetricCard, SectionHeader, StatusBadge,
  formatNumber, getMetric
} from '../../../inspector/shared';
import CollapseGroup from '../parts/CollapseGroup';

export default function LinksTab({ page }: { page: any }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="Internal PR" value={getMetric(page, 'internalPageRank')} />
        <MetricCard label="Inlinks" value={formatNumber(page?.inlinks)} />
        <MetricCard label="Outlinks" value={formatNumber(page?.outlinks)} />
        <MetricCard label="Equity Flow" value={getMetric(page, 'linkEquity')} />
      </div>

      <CollapseGroup title="Link distribution">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 min-w-0">
          <DataRow label="Dofollow Inlinks" value={formatNumber(page?.dofollowInlinks)} />
          <DataRow label="Nofollow Inlinks" value={formatNumber(page?.nofollowInlinks)} />
          <DataRow label="Unique domains" value={formatNumber(page?.uniqueReferringDomains)} />
          <DataRow label="Orphan risk" value={Number(page?.inlinks || 0) === 0 ? 'High' : 'Low'} status={Number(page?.inlinks || 0) === 0 ? 'warn' : 'pass'} />
        </div>
      </CollapseGroup>

      <CollapseGroup title="External signals">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 min-w-0">
          <DataRow label="External Outlinks" value={formatNumber(page?.externalOutlinks)} />
          <DataRow label="Unique External" value={formatNumber(page?.uniqueExternalOutlinks)} />
          <DataRow label="Broken External" value={formatNumber(page?.brokenExternalLinks)} status={Number(page?.brokenExternalLinks || 0) > 0 ? 'warn' : 'pass'} />
        </div>
      </CollapseGroup>
    </div>
  );
}
