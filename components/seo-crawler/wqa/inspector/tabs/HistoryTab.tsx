import React from 'react';
import {
  DataRow, SectionHeader, 
  formatDate, formatNumber
} from '../../../inspector/shared';
import CollapseGroup from '../parts/CollapseGroup';
import { History, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export default function HistoryTab({ page }: { page: any }) {
  const history = Array.isArray(page?.crawlSessions) ? page.crawlSessions : [];
  
  return (
    <div className="space-y-6">
      <CollapseGroup title="Crawl History">
        <div className="space-y-2">
          {history.length > 0 ? history.map((s: any, i: number) => (
            <div key={i} className="bg-[#0a0a0a] border border-[#222] rounded p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-[#1a1a1a] rounded text-[#666]">
                  <History size={14} />
                </div>
                <div>
                  <div className="text-[12px] font-medium text-white">{formatDate(s.date)}</div>
                  <div className="text-[10px] text-[#555] uppercase tracking-wider">{s.status || 'Success'}</div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-[10px] text-[#555] uppercase">Health</div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[12px] font-mono font-bold">{s.healthScore}</span>
                    <DeltaIcon current={s.healthScore} prev={history[i+1]?.healthScore} />
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-[#555] uppercase">Clicks</div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[12px] font-mono font-bold">{formatNumber(s.clicks)}</span>
                    <DeltaIcon current={s.clicks} prev={history[i+1]?.clicks} />
                  </div>
                </div>
              </div>
            </div>
          )) : (
            <div className="text-[12px] text-[#666] italic p-4 text-center border border-dashed border-[#222] rounded">
              No previous crawl data for this URL.
            </div>
          )}
        </div>
      </CollapseGroup>

      <CollapseGroup title="Signal changes (30d)">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 min-w-0">
          <DataRow label="First discovered" value={formatDate(page?.firstSeenDate)} />
          <DataRow label="Last significant change" value={formatDate(page?.lastModified)} />
          <DataRow label="Detected intent shift" value={page?.intentShift ? 'Yes' : 'None'} status={page?.intentShift ? 'warn' : 'pass'} />
          <DataRow label="Authority delta" value={`${page?.authorityDelta || 0}%`} status={(page?.authorityDelta || 0) < 0 ? 'fail' : 'pass'} />
        </div>
      </CollapseGroup>
    </div>
  );
}

function DeltaIcon({ current, prev }: { current: number; prev?: number }) {
  if (prev === undefined) return <Minus size={10} className="text-[#333]" />;
  const delta = current - prev;
  if (delta > 0) return <ArrowUpRight size={12} className="text-green-500" />;
  if (delta < 0) return <ArrowDownRight size={12} className="text-red-500" />;
  return <Minus size={10} className="text-[#555]" />;
}
