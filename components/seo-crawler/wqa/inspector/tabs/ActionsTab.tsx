import React from 'react';
import { SectionHeader, getActions } from '../../../inspector/shared';
import ActionCard from '../parts/ActionCard';

export default function ActionsTab({ page }: { page: any }) {
  const issues = getActions(page);
  const primaries = issues.slice(0, 3);
  const secondaries = issues.slice(3);

  return (
    <div>
      <SectionHeader title="Primary actions" />
      <div className="space-y-2 mb-5">
        {primaries.length === 0 && (
          <div className="bg-[#0a0a0a] border border-[#222] rounded p-4 text-[12px] text-[#666] text-center">
            No actions assigned. Page is healthy.
          </div>
        )}
        {primaries.map((a, i) => (
          <ActionCard
            key={`${a.id}-${i}`}
            title={a.label}
            reason={a.description || a.reason}
            category={a.category || (a.id.startsWith('C') ? 'content' : a.id.startsWith('T') ? 'technical' : 'industry')}
            priority={a.priority || (a.severity === 'CRITICAL' ? 1 : a.severity === 'HIGH' ? 3 : a.severity === 'MEDIUM' ? 6 : 9)}
            estimatedImpact={a.estimatedImpact || (a.impactHint === 'high' ? 100 : a.impactHint === 'medium' ? 50 : 10)}
            effort={a.effort || (a.effortMinutes < 60 ? 'low' : a.effortMinutes < 240 ? 'medium' : 'high')}
            factors={a.factors}
            confidence={a.confidence}
            primary={i === 0 && (a.type === 'error' || a.severity === 'HIGH' || a.severity === 'CRITICAL')}
          />
        ))}
      </div>

      {secondaries.length > 0 && (
        <>
          <SectionHeader title="Other matched rules" />
          <div className="space-y-2 mb-5">
            {secondaries.map((a, i) => (
              <ActionCard
                key={`sec-${i}`}
                title={a.label}
                reason={a.description || a.reason}
                category={a.category || (a.id.startsWith('C') ? 'content' : a.id.startsWith('T') ? 'technical' : 'industry')}
                priority={a.priority || (a.severity === 'CRITICAL' ? 1 : a.severity === 'HIGH' ? 3 : a.severity === 'MEDIUM' ? 6 : 9)}
                estimatedImpact={a.estimatedImpact || (a.impactHint === 'high' ? 100 : a.impactHint === 'medium' ? 50 : 10)}
                effort={a.effort || (a.effortMinutes < 60 ? 'low' : a.effortMinutes < 240 ? 'medium' : 'high')}
                factors={a.factors}
                confidence={a.confidence}
              />
            ))}
          </div>
        </>
      )}

      <SectionHeader title="Manage" />
      <div className="flex flex-wrap gap-2">
        <ManageButton label="Mark as done" />
        <ManageButton label="Snooze 30d" />
        <ManageButton label="Assign" />
        <ManageButton label="Create task" />
        <ManageButton label="Ignore" />
      </div>
    </div>
  );
}

function ManageButton({ label }: { label: string }) {
  return (
    <button className="px-3 py-1.5 rounded border border-[#262626] bg-[#0f0f0f] text-[11px] text-[#ccc] hover:border-[#F5364E]/40 hover:text-white transition-colors">
      {label}
    </button>
  );
}
