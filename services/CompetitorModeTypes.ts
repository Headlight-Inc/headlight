/**
 * services/CompetitorModeTypes.ts
 * 
 * Types for the competitive mode state.
 */

import type { CompetitorProfile } from './CompetitorMatrixConfig';

export type CompetitiveViewMode = 'matrix' | 'charts' | 'battlefield' | 'timeline' | 'brief';

export interface CompetitiveBrief {
  executiveSummary: string;
  perCompetitor: Array<{ domain: string; strengths: string; weaknesses: string; strategy: string }>;
  recommendedActions: Array<{ priority: 'P0' | 'P1' | 'P2'; action: string; timeline: string }>;
  generatedAt: number;
}

export interface CompetitorSoVResult {
  domain: string;
  shareOfVoice: number;
  sharedKeywordCount: number;
  winsCount: number;
}

export interface CompetitiveModeState {
  /** Whether competitive mode is active (vs. standard audit mode) */
  isActive: boolean;
  /** The current main view within competitive mode */
  viewMode: CompetitiveViewMode;
  /** Which competitor domains are currently selected/visible in the comparison */
  activeCompetitorDomains: string[];
  /** Your own site's profile (built from your crawl data) */
  ownProfile: CompetitorProfile | null;
  /** All competitor profiles keyed by domain */
  competitorProfiles: Map<string, CompetitorProfile>;
  /** Share of Voice results per competitor */
  sovResults: Map<string, CompetitorSoVResult>;
  /** AI-generated competitive brief */
  brief: CompetitiveBrief | null;
  /** Loading states */
  isCrawlingCompetitor: string | null; // domain currently being crawled, or null
  isGeneratingBrief: boolean;
}

export const DEFAULT_COMPETITIVE_STATE: CompetitiveModeState = {
  isActive: false,
  viewMode: 'matrix',
  activeCompetitorDomains: [],
  ownProfile: null,
  competitorProfiles: new Map(),
  sovResults: new Map(),
  brief: null,
  isCrawlingCompetitor: null,
  isGeneratingBrief: false,
};
