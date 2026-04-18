// services/ActionCatalog.ts
import type { ActionFactors } from './ActionFactors';
import {
  estimateCtrImprovementClicks,
  estimatePositionImprovementClicks,
} from './ExpectedCtrCurve';

export type ActionCategory = 'technical' | 'content' | 'industry';

export interface ActionRule {
  id: string;
  label: string;
  category: ActionCategory;
  priority: number;              // 1 = highest
  effort: 'low' | 'medium' | 'high';
  appliesIf: (f: ActionFactors) => boolean;
  reason: (f: ActionFactors) => string;
  impact: (f: ActionFactors) => number;
  industries?: string[];         // limit rule to specific industries
}

// ── Shared impact primitives (one source of truth) ──
const I = {
  ctrLift:      (f: ActionFactors) => estimateCtrImprovementClicks(f.impressions, f.position, f.ctr),
  posLift:      (f: ActionFactors, steps: number) => estimatePositionImprovementClicks(f.impressions, f.position, steps),
  trafficRecover: (f: ActionFactors, sessions: number) =>
    Math.round(sessions * Math.min(1, Math.abs((f.trafficTrend === 'down' ? -0.3 : 0))) * 0.5) || 0,
  pctOfImpr:    (f: ActionFactors, pct: number) => Math.round(f.impressions * pct),
  schemaLift:   (f: ActionFactors, mult: number) => Math.round(f.impressions * f.ctr * mult),
};

// ─────────────────────────── TECHNICAL ACTIONS ───────────────────────────
export const TECHNICAL_ACTIONS: ActionRule[] = [
  {
    id: 'fix_server_errors', label: 'Fix Server Errors', category: 'technical',
    priority: 1, effort: 'medium',
    appliesIf: (f) => f.isHtmlPage && f.statusCode >= 500,
    reason:    (f) => `Page returns ${f.statusCode}. Nothing else matters until this is fixed.`,
    impact:    (f) => I.pctOfImpr(f, 0.05),
  },
  {
    id: 'restore_broken_page', label: 'Restore Broken Page', category: 'technical',
    priority: 2, effort: 'low',
    appliesIf: (f) => f.isHtmlPage && f.statusCode >= 400 &&
      (f.impressions > 50 || f.referringDomains > 0 || f.clicks > 10),
    reason:    (f) => `${f.statusCode} page with measurable value. Redirect to the closest equivalent page to recover value.`,
    impact:    (f) => I.pctOfImpr(f, 0.05),
  },
  {
    id: 'remove_dead_page', label: 'Remove Dead Page', category: 'technical',
    priority: 3, effort: 'low',
    appliesIf: (f) => f.isHtmlPage && f.statusCode >= 400 &&
      f.impressions <= 50 && f.referringDomains === 0,
    reason:    () => `Broken page with no traffic, impressions, or backlinks. Remove or redirect.`,
    impact:    () => 0,
  },
  {
    id: 'unblock_from_index', label: 'Unblock From Index', category: 'technical',
    priority: 4, effort: 'low',
    appliesIf: (f) => f.indexable === false && (f.impressions > 50 || f.ipr > 30),
    reason:    () => `Page has value but is not indexable. Check noindex, canonical, and robots.`,
    impact:    (f) => I.pctOfImpr(f, 0.02) || 10,
  },
  {
    id: 'fix_redirect_chain', label: 'Fix Redirect Chain', category: 'technical',
    priority: 5, effort: 'low',
    appliesIf: (f) => f.isRedirectLoop || f.redirectChainLength >= 3,
    reason:    (f) => f.isRedirectLoop ? 'Redirect loop detected.' : `${f.redirectChainLength}-hop redirect chain detected.`,
    impact:    (f) => I.pctOfImpr(f, 0.01),
  },
  {
    id: 'fix_canonical', label: 'Fix Canonical', category: 'technical',
    priority: 6, effort: 'low',
    appliesIf: (f) => f.multipleCanonical || f.canonicalChain,
    reason:    (f) => f.multipleCanonical ? 'Multiple canonical tags found.' : 'Canonical chain detected.',
    impact:    (f) => I.pctOfImpr(f, 0.02),
  },
  {
    id: 'add_to_sitemap', label: 'Add to Sitemap', category: 'technical',
    priority: 7, effort: 'low',
    appliesIf: (f) => !f.inSitemap && f.indexable === true && f.statusCode === 200 &&
      (f.impressions > 0 || f.inlinks > 3),
    reason:    () => 'Indexable page is not in sitemap.xml.',
    impact:    (f) => I.pctOfImpr(f, 0.01) || 5,
  },
  {
    id: 'improve_speed', label: 'Improve Speed', category: 'technical',
    priority: 8, effort: 'medium',
    appliesIf: (f) => f.speedScore === 'Poor' && (f.impressions > 500 || f.clicks > 50),
    reason:    () => 'Page has meaningful traffic but poor Core Web Vitals.',
    impact:    (f) => Math.round(f.clicks * 0.05),
  },
  {
    id: 'fix_security', label: 'Fix Security', category: 'technical',
    priority: 9, effort: 'low',
    appliesIf: (f) => f.mixedContent || f.sslValid === false,
    reason:    (f) => f.mixedContent ? 'Mixed content detected.' : 'Invalid SSL certificate.',
    impact:    () => 0,
  },
  {
    id: 'add_internal_links', label: 'Add Internal Links', category: 'technical',
    priority: 10, effort: 'low',
    appliesIf: (f) => f.inlinks <= 1 && (f.valueTier === '★★★' || f.valueTier === '★★'),
    reason:    (f) => `Valuable page (${f.valueTier}) has only ${f.inlinks} inlink(s). Increase internal link support.`,
    impact:    (f) => I.pctOfImpr(f, 0.01) || 5,
  },
  {
    id: 'fix_navigation_structure', label: 'Fix Navigation Structure', category: 'technical',
    priority: 11, effort: 'low',
    appliesIf: (f) => f.inlinks === 0 && (f.impressions > 50 || f.clicks > 20),
    reason:    () => `Page earns traffic but has zero internal links pointing to it — invisible to crawlers.`,
    impact:    (f) => I.pctOfImpr(f, 0.03) || 5,
  },
  {
    id: 'consolidate_duplicates', label: 'Consolidate Duplicates', category: 'technical',
    priority: 12, effort: 'medium',
    appliesIf: (f) => (Boolean((f as any).isDuplicate) || Boolean((f as any).exactDuplicate)) && f.impressions > 0,
    reason:    () => 'Page appears duplicate and already earns impressions.',
    impact:    (f) => I.pctOfImpr(f, 0.02),
  },
  {
    id: 'fix_hreflang', label: 'Fix Hreflang', category: 'technical',
    priority: 13, effort: 'low',
    appliesIf: (f) => f.hreflangNoReturn,
    reason:    () => 'Hreflang tags are not reciprocal.',
    impact:    () => 0,
  },
];

// ─────────────────────────── CONTENT ACTIONS ───────────────────────────
export const CONTENT_ACTIONS: ActionRule[] = [
  {
    id: 'rewrite_title_meta', label: 'Rewrite Title & Meta', category: 'content',
    priority: 1, effort: 'low',
    appliesIf: (f) => f.availability.gsc && f.impressions > 200 && f.ctrGap < -0.02,
    reason:    (f) => `${f.impressions.toLocaleString()} impressions but CTR is ${(f.ctr * 100).toFixed(1)}% (below expected at position ${Math.round(f.position)}).`,
    impact:    (f) => I.ctrLift(f),
  },
  {
    id: 'recover_declining_content', label: 'Recover Declining Content', category: 'content',
    priority: 2, effort: 'medium',
    appliesIf: (f) => (f.trafficTrend === 'down' || f.decayRisk > 40) && f.impressions > 100,
    reason:    (f) => f.trafficTrend === 'down'
      ? `Traffic declining. Review for keyword shifts or content decay.`
      : `Content decay risk is high (${Math.round(f.decayRisk)}%). Refresh recommended.`,
    impact:    (f) => I.posLift(f, 2),
  },
  {
    id: 'fix_keyword_mismatch', label: 'Fix Keyword Mismatch', category: 'content',
    priority: 3, effort: 'medium',
    appliesIf: (f) => f.intentAlign === 'misaligned' && f.impressions > 50,
    reason:    () => 'Page intent does not match the primary query intent. Restructure to align with what searchers expect.',
    impact:    (f) => I.posLift(f, 5),
  },
  {
    id: 'expand_thin_content', label: 'Expand Thin Content', category: 'content',
    priority: 4, effort: 'medium',
    appliesIf: (f) => {
      const threshold = f.pageCategory === 'blog_post' ? 300 : f.pageCategory === 'product' ? 150 : 100;
      return f.wordCount > 0 && f.wordCount < threshold && (f.impressions > 50 || f.referringDomains > 0);
    },
    reason:    (f) => `Only ${f.wordCount} words with existing value signals — thin for this category.`,
    impact:    (f) => I.posLift(f, 3),
  },
  {
    id: 'update_stale_content', label: 'Update Stale Content', category: 'content',
    priority: 5, effort: 'medium',
    appliesIf: (f) => (f.freshness === 'stale' || f.freshness === 'ancient') && f.position > 5 && f.position <= 30,
    reason:    (f) => `Content is ${f.freshness} and currently ranks around position ${Math.round(f.position)}. A freshness update could recover rankings.`,
    impact:    (f) => I.posLift(f, 2),
  },
  {
    id: 'add_schema', label: 'Add Schema', category: 'content',
    priority: 6, effort: 'low',
    appliesIf: (f) => !f.hasSchema && f.statusCode === 200 && f.isHtmlPage,
    reason:    (f) => `No schema markup detected. Add the appropriate schema for ${f.pageCategory}.`,
    impact:    (f) => I.schemaLift(f, 0.3),
  },
  {
    id: 'add_faq_schema', label: 'Add FAQ Schema', category: 'content',
    priority: 7, effort: 'low',
    appliesIf: (f) => f.selfContainedAnswers >= 2 && !f.hasFaqSchema && f.impressions > 50,
    reason:    (f) => `Page has ${f.selfContainedAnswers} Q&A-style answers but no FAQPage schema.`,
    impact:    (f) => I.schemaLift(f, 0.4),
  },
  {
    id: 'improve_eeat', label: 'Improve E-E-A-T', category: 'content',
    priority: 8, effort: 'medium',
    appliesIf: (f) => (f.industry === 'healthcare' || f.industry === 'finance') && (f.eeat ?? 100) < 40,
    reason:    (f) => `Low E-E-A-T (${f.eeat}) for ${f.industry}. Add author credentials, review dates, and trust signals.`,
    impact:    (f) => I.posLift(f, 3),
  },
  {
    id: 'resolve_cannibalization', label: 'Resolve Cannibalization', category: 'content',
    priority: 9, effort: 'medium',
    appliesIf: (f) => f.isCannibalized && f.position > 10,
    reason:    () => 'Multiple pages target the same keyword. Consolidate or differentiate.',
    impact:    (f) => I.posLift(f, 4),
  },
  {
    id: 'optimize_serp_features', label: 'Optimize for SERP Features', category: 'content',
    priority: 10, effort: 'low',
    appliesIf: (f) => f.position >= 2 && f.position <= 8,
    reason:    (f) => `Position ${Math.round(f.position)} — structured formatting could earn a featured snippet.`,
    impact:    (f) => I.posLift(f, 2),
  },
  {
    id: 'acquire_backlinks', label: 'Acquire Backlinks', category: 'content',
    priority: 11, effort: 'high',
    appliesIf: (f) => f.availability.backlinks &&
      (f.valueTier === '★★★' || f.valueTier === '★★') &&
      f.referringDomains === 0 && f.impressions > 100 &&
      f.keywordHealth === 'striking_distance',
    reason:    (f) => `Striking-distance page with ${f.impressions.toLocaleString()} impressions but zero referring domains.`,
    impact:    (f) => I.posLift(f, 4),
  },
  {
    id: 'improve_readability', label: 'Improve Readability', category: 'content',
    priority: 12, effort: 'medium',
    appliesIf: (f) => f.readability === 'Difficult' && f.clicks > 20,
    reason:    () => `Difficult readability with high bounce — simplify to reduce drop-off.`,
    impact:    (f) => Math.round(f.clicks * 0.1),
  },
  {
    id: 'repurpose_page', label: 'Repurpose Page', category: 'content',
    priority: 13, effort: 'medium',
    appliesIf: (f) => f.ipr > 40 && f.impressions === 0 && f.clicks === 0 && f.wordCount < 200,
    reason:    (f) => `Strong internal link equity (IPR ${Math.round(f.ipr)}) but no search traffic. Rewrite around a real keyword.`,
    impact:    () => 0,
  },
  {
    id: 'remove_or_merge', label: 'Remove or Merge', category: 'content',
    priority: 14, effort: 'low',
    appliesIf: (f) => f.wordCount < 50 && f.impressions === 0 && f.referringDomains === 0 && f.inlinks <= 1,
    reason:    () => 'Minimal content and no value signals. Merge into a stronger page or remove.',
    impact:    () => 0,
  },
];

// ─────────────────────────── INDUSTRY ACTIONS ───────────────────────────
export const INDUSTRY_ACTIONS: ActionRule[] = [
  // E-commerce
  { id: 'add_product_schema', label: 'Add Product Schema', category: 'industry', priority: 6, effort: 'low', industries: ['ecommerce'],
    appliesIf: (f) => f.pageCategory === 'product' && !(f.industrySignals?.hasProductSchema),
    reason: () => 'Product page lacks Product/Offer schema. Required for price and availability rich results.',
    impact: (f) => I.schemaLift(f, 0.3) },
  { id: 'add_visible_price', label: 'Add Visible Price', category: 'industry', priority: 8, effort: 'low', industries: ['ecommerce'],
    appliesIf: (f) => f.pageCategory === 'product' && f.industrySignals?.priceVisible === false,
    reason: () => 'Product page appears to hide or omit pricing.', impact: () => 0 },
  { id: 'fix_out_of_stock_indexed', label: 'Deindex Out-of-Stock', category: 'industry', priority: 5, effort: 'low', industries: ['ecommerce'],
    appliesIf: (f) => f.pageCategory === 'product' && f.industrySignals?.outOfStock === true && f.indexable !== false,
    reason: () => 'Out-of-stock product page is indexable.', impact: () => 0 },

  // News
  { id: 'add_to_news_sitemap', label: 'Add to News Sitemap', category: 'industry', priority: 4, effort: 'low', industries: ['news'],
    appliesIf: (f) => f.pageCategory === 'blog_post' && !f.industrySignals?.inNewsSitemap,
    reason: () => 'Article missing from news sitemap. Required for Top Stories eligibility.',
    impact: (f) => I.pctOfImpr(f, 0.1) || 50 },
  { id: 'add_article_schema', label: 'Add Article Schema', category: 'industry', priority: 6, effort: 'low', industries: ['news', 'blog'],
    appliesIf: (f) => f.pageCategory === 'blog_post' && !(f.industrySignals?.hasArticleSchema),
    reason: () => 'Article missing Article/NewsArticle schema.', impact: (f) => I.schemaLift(f, 0.3) },
  { id: 'add_author_attribution', label: 'Add Author Attribution', category: 'industry', priority: 7, effort: 'low', industries: ['news', 'blog', 'healthcare', 'finance'],
    appliesIf: (f) => f.pageCategory === 'blog_post' && !f.industrySignals?.hasAuthorAttribution,
    reason: () => 'Article lacks visible author byline — required for E-E-A-T.', impact: () => 0 },

  // Local + restaurant
  { id: 'add_local_business_schema', label: 'Add LocalBusiness Schema', category: 'industry', priority: 5, effort: 'low', industries: ['local', 'restaurant'],
    appliesIf: (f) => f.pageCategory === 'location_page' && !f.industrySignals?.hasLocalBusinessSchema,
    reason: () => 'Location page lacks LocalBusiness schema.', impact: (f) => I.schemaLift(f, 0.4) },
  { id: 'fix_nap_consistency', label: 'Fix NAP Consistency', category: 'industry', priority: 6, effort: 'low', industries: ['local', 'restaurant'],
    appliesIf: (f) => f.pageCategory === 'location_page' && (f as any).napHasDistinctAddress === true,
    reason: () => 'Location page has NAP that does not match homepage.', impact: (f) => I.posLift(f, 1) },
  { id: 'add_menu_schema', label: 'Add Menu Schema', category: 'industry', priority: 6, effort: 'low', industries: ['restaurant'],
    appliesIf: (f) => /menu/i.test(f.pageCategory) && !f.industrySignals?.hasMenuSchema,
    reason: () => 'Menu page lacks Menu schema.', impact: (f) => I.schemaLift(f, 0.5) },

  // SaaS
  { id: 'add_trial_cta', label: 'Add Trial CTA', category: 'industry', priority: 7, effort: 'low', industries: ['saas'],
    appliesIf: (f) => (f.pageCategory === 'landing_page' || f.pageCategory === 'service_page') &&
      !f.industrySignals?.hasTrialCta && !f.industrySignals?.hasPricingLink,
    reason: () => 'Landing/service page has no trial or pricing CTA.', impact: () => 0 },

  // Education
  { id: 'add_course_schema', label: 'Add Course Schema', category: 'industry', priority: 6, effort: 'low', industries: ['education'],
    appliesIf: (f) => f.pageCategory === 'service_page' &&
      !(f.industrySignals?.hasCourseSchema),
    reason: () => 'Course-like page missing Course schema.', impact: (f) => I.schemaLift(f, 0.3) },

  // Finance
  { id: 'add_financial_disclaimer', label: 'Add Financial Disclaimer', category: 'industry', priority: 4, effort: 'low', industries: ['finance'],
    appliesIf: (f) => f.pageCategory === 'blog_post' && !f.industrySignals?.hasFinancialDisclaimer,
    reason: () => 'Financial content lacks "not financial advice" disclaimer (YMYL).', impact: () => 0 },

  // Healthcare
  { id: 'add_medical_author', label: 'Add Medical Author', category: 'industry', priority: 4, effort: 'medium', industries: ['healthcare'],
    appliesIf: (f) => f.pageCategory === 'blog_post' && !f.industrySignals?.hasMedicalAuthor,
    reason: () => 'Medical content lacks a credentialed author (YMYL).', impact: (f) => I.posLift(f, 2) },

  // Real estate
  { id: 'add_listing_schema', label: 'Add Listing Schema', category: 'industry', priority: 6, effort: 'low', industries: ['real_estate'],
    appliesIf: (f) => /listing|property/i.test(f.pageCategory) && !f.industrySignals?.hasRealEstateSchema,
    reason: () => 'Listing page missing RealEstateListing schema.', impact: (f) => I.schemaLift(f, 0.25) },
];

// ── Dispatch ─────────────────────────────────────────────────────────────
export interface AssignedAction {
  id: string;
  action: string;
  reason: string;
  priority: number;
  estimatedImpact: number;
  effort: 'low' | 'medium' | 'high';
  category: ActionCategory;
}

function evaluate(rules: ActionRule[], f: ActionFactors): AssignedAction[] {
  return rules
    .filter((r) => !r.industries || r.industries.includes(f.industry))
    .filter((r) => r.appliesIf(f))
    .map((r) => ({
      id: r.id, action: r.label, reason: r.reason(f),
      priority: r.priority, estimatedImpact: Math.max(0, r.impact(f)),
      effort: r.effort, category: r.category,
    }));
}

export function pickTechnicalAction(f: ActionFactors): AssignedAction | null {
  if (!f.isHtmlPage) return null;
  return evaluate(TECHNICAL_ACTIONS, f).sort((a, b) => a.priority - b.priority)[0] ?? null;
}
export function pickContentAction(f: ActionFactors): AssignedAction | null {
  if (!f.isHtmlPage || f.statusCode >= 400) return null;
  return evaluate(CONTENT_ACTIONS, f).sort((a, b) => a.priority - b.priority)[0] ?? null;
}
export function pickIndustryActions(f: ActionFactors): AssignedAction[] {
  return evaluate(INDUSTRY_ACTIONS, f).sort((a, b) => a.priority - b.priority);
}

// ── Primary / secondary precedence (one place) ──
export function derivePrimaryAndSecondaryAction(
  tech: AssignedAction | null,
  content: AssignedAction | null,
  industry: AssignedAction[]
): { primary: AssignedAction | null; secondary: AssignedAction | null; all: AssignedAction[] } {
  const all = [tech, content, ...industry].filter(Boolean) as AssignedAction[];
  const sorted = all.slice().sort((a, b) => {
    // Critical technical (1–3) always wins
    if (a.priority <= 3 && b.priority > 3) return -1;
    if (b.priority <= 3 && a.priority > 3) return 1;
    // Then by impact desc, then priority asc
    if (b.estimatedImpact !== a.estimatedImpact) return b.estimatedImpact - a.estimatedImpact;
    return a.priority - b.priority;
  });
  return { primary: sorted[0] ?? null, secondary: sorted[1] ?? null, all };
}
