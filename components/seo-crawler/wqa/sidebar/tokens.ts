export const WQA_SIDEBAR_TOKENS = {
    surface:      '#0a0a0a',
    surfaceAlt:   '#0d0d0d',
    card:         '#111',
    cardAlt:      '#141414',
    border:       '#1a1a1a',
    borderAlt:    '#222',
    textMuted:    '#777',
    textDim:      '#555',
    accent:       '#F5364E',
    good:         '#22c55e',
    warn:         '#f59e0b',
    bad:          '#ef4444',
    info:         '#3b82f6',
    purple:       '#a855f7',
} as const;

export const WQA_SIDEBAR_LAYOUT = {
    tabBarHeight: 38,
    bodyPad:      12,
    cardPad:      12,
    cardGap:      16,
    rowGap:       6,
    tileGap:      6,
    headingSize:  9,
    labelSize:    10,
    bodySize:     11,
    numberSize:   14,
} as const;

export type WqaSidebarTone = 'good' | 'warn' | 'bad' | 'accent' | 'neutral';

export const toneColor = (t: WqaSidebarTone): string => {
    switch (t) {
        case 'good':   return WQA_SIDEBAR_TOKENS.good;
        case 'warn':   return WQA_SIDEBAR_TOKENS.warn;
        case 'bad':    return WQA_SIDEBAR_TOKENS.bad;
        case 'accent': return WQA_SIDEBAR_TOKENS.accent;
        default:       return WQA_SIDEBAR_TOKENS.textMuted;
    }
};
