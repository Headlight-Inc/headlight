import React from 'react';

export const SectionTitle = ({ title, hint }: { title: string; hint?: string }) => (
    <div className="flex items-baseline justify-between mb-2">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-[#888]">{title}</h4>
        {hint && <span className="text-[9px] text-[#555]">{hint}</span>}
    </div>
);

export const Card = ({ children, pad = true }: { children: React.ReactNode; pad?: boolean }) => (
    <div className={`bg-[#0d0d0d] border border-[#1a1a1a] rounded-lg ${pad ? 'p-3' : ''}`}>
        {children}
    </div>
);

export const StatTile = ({
    label, value, sub, tone = 'neutral',
}: {
    label: string; value: React.ReactNode; sub?: string;
    tone?: 'neutral' | 'good' | 'warn' | 'bad' | 'accent';
}) => {
    const toneClass = {
        neutral: 'text-white',
        good:    'text-green-400',
        warn:    'text-orange-400',
        bad:     'text-red-400',
        accent:  'text-[#F5364E]',
    }[tone];
    return (
        <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded px-2.5 py-2">
            <div className="text-[9px] text-[#666] uppercase tracking-widest">{label}</div>
            <div className={`text-[16px] font-black leading-tight mt-0.5 ${toneClass}`}>{value}</div>
            {sub && <div className="text-[9px] text-[#666] mt-0.5 truncate">{sub}</div>}
        </div>
    );
};

export const Bar = ({ pct, tone = 'accent' }: { pct: number; tone?: 'accent' | 'good' | 'warn' | 'bad' }) => {
    const color = tone === 'good' ? '#22c55e' : tone === 'warn' ? '#f59e0b' : tone === 'bad' ? '#ef4444' : '#F5364E';
    return (
        <div className="h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${Math.max(0, Math.min(100, pct))}%`, backgroundColor: color }} />
        </div>
    );
};

export const Row = ({ label, value, hint, tone }: {
    label: string; value: React.ReactNode; hint?: string;
    tone?: 'good' | 'warn' | 'bad' | 'neutral';
}) => {
    const color = tone === 'good' ? 'text-green-400' : tone === 'warn' ? 'text-orange-400' : tone === 'bad' ? 'text-red-400' : 'text-white';
    return (
        <div className="flex items-center justify-between py-1.5 border-b border-[#161616] last:border-b-0">
            <div className="min-w-0">
                <div className="text-[11px] text-[#bbb] truncate">{label}</div>
                {hint && <div className="text-[9px] text-[#555] truncate">{hint}</div>}
            </div>
            <div className={`text-[12px] font-mono font-bold shrink-0 ml-2 ${color}`}>{value}</div>
        </div>
    );
};

export const Chip = ({ label, tone = 'neutral', onClick, active }: {
    label: string;
    tone?: 'neutral' | 'good' | 'warn' | 'bad' | 'accent';
    onClick?: () => void; active?: boolean;
}) => {
    const base = 'px-1.5 py-0.5 rounded text-[9px] font-bold border transition-colors';
    const tones = {
        neutral: 'bg-[#111] text-[#aaa] border-[#222]',
        good:    'bg-green-500/10 text-green-400 border-green-500/25',
        warn:    'bg-orange-500/10 text-orange-400 border-orange-500/25',
        bad:     'bg-red-500/10 text-red-400 border-red-500/25',
        accent:  'bg-[#F5364E]/10 text-[#F5364E] border-[#F5364E]/30',
    }[tone];
    const activeCls = active ? 'ring-1 ring-[#F5364E]' : '';
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={!onClick}
            className={`${base} ${tones} ${activeCls} ${onClick ? 'hover:border-[#333] cursor-pointer' : 'cursor-default'}`}
        >
            {label}
        </button>
    );
};

export const fmtInt = (n: unknown) => {
    const v = Number(n);
    if (!Number.isFinite(v)) return '—';
    if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
    if (Math.abs(v) >= 1_000)     return `${(v / 1_000).toFixed(1)}k`;
    return v.toLocaleString();
};

export const fmtPct = (n: unknown, decimals = 0) => {
    const v = Number(n);
    if (!Number.isFinite(v)) return '—';
    return `${v.toFixed(decimals)}%`;
};

export const fmtScore = (n: unknown) => {
    const v = Number(n);
    if (!Number.isFinite(v)) return '—';
    return Math.round(v).toString();
};

export const scoreTone = (score: number): 'good' | 'warn' | 'bad' =>
    score >= 75 ? 'good' : score >= 50 ? 'warn' : 'bad';
