export function fmtNumber(n: number | null | undefined, opts?: Intl.NumberFormatOptions): string {
    if (n === null || n === undefined || Number.isNaN(n)) return '—';
    return new Intl.NumberFormat(undefined, opts).format(n);
}

export function fmtPct(n: number | null | undefined, fractionDigits = 0): string {
    if (n === null || n === undefined || Number.isNaN(n)) return '—';
    return `${(n * 100).toFixed(fractionDigits)}%`;
}

export function fmtDelta(n: number, suffix = ''): string {
    if (!Number.isFinite(n) || n === 0) return `0${suffix}`;
    const sign = n > 0 ? '▲' : '▼';
    return `${sign} ${Math.abs(n).toLocaleString()}${suffix}`;
}

export function fmtDuration(ms: number | null | undefined): string {
    if (!ms) return '—';
    if (ms < 1000) return `${Math.round(ms)}ms`;
    if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
    const m = Math.floor(ms / 60_000);
    const s = Math.round((ms % 60_000) / 1000);
    return `${m}m ${s}s`;
}

export function fmtRelativeTime(ts: number | null): string {
    if (!ts) return 'never';
    const diff = Date.now() - ts;
    if (diff < 60_000) return 'just now';
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
    if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
    return `${Math.floor(diff / 86_400_000)}d ago`;
}

export type Tone = 'good' | 'warn' | 'bad' | 'info' | 'mute';

export function toneText(t: Tone): string {
    switch (t) {
        case 'good': return 'text-green-400';
        case 'warn': return 'text-orange-400';
        case 'bad':  return 'text-red-400';
        case 'info': return 'text-blue-400';
        default:     return 'text-[#888]';
    }
}

export function toneBg(t: Tone): string {
    switch (t) {
        case 'good': return 'bg-green-500';
        case 'warn': return 'bg-orange-500';
        case 'bad':  return 'bg-red-500';
        case 'info': return 'bg-blue-500';
        default:     return 'bg-[#333]';
    }
}
