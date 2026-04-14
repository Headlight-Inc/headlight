import React from 'react';

interface FunnelStep {
  label: string;
  value: number;
  color?: string;
}

interface Props {
  steps: FunnelStep[];
}

const DEFAULT_COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd'];

export default function FunnelChart({ steps }: Props) {
  if (steps.length === 0) return null;
  const maxVal = Math.max(...steps.map((s) => s.value), 1);

  return (
    <div className="space-y-1">
      {steps.map((step, i) => {
        const pct = (step.value / maxVal) * 100;
        const color = step.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length];
        return (
          <div key={step.label} className="flex items-center gap-2">
            <div className="flex-1" style={{ paddingLeft: `${i * 8}px`, paddingRight: `${i * 8}px` }}>
              <div
                className="h-7 rounded flex items-center px-2 justify-between transition-all"
                style={{ width: `${Math.max(pct, 15)}%`, backgroundColor: color }}
              >
                <span className="text-[10px] font-semibold text-white truncate">{step.label}</span>
                <span className="text-[10px] font-bold text-white/90 ml-1 shrink-0">{step.value.toLocaleString()}</span>
              </div>
            </div>
            {i < steps.length - 1 && (
              <span className="text-[9px] text-[#666] shrink-0">
                {step.value > 0 ? `${Math.round((steps[i + 1].value / step.value) * 100)}%` : '—'}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
