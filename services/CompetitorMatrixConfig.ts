/**
 * services/CompetitorMatrixConfig.ts
 *
 * Complete competitor profile type + comparison matrix rows.
 * 177 metrics, 0 manual entries.
 */

// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════

export type CellFormat =
  | 'text'
  | 'number'
  | 'boolean'
  | 'url'
  | 'score_100'
  | 'currency'
  | 'list'
  | 'rating_5';

export type DataSource =
  | 'crawl'
  | 'sitemap'
  | 'dns'
  | 'external'
  | 'social_api'
  | 'ai'
  | 'computed'
  | 'psi';

export interface ComparisonRowDef {
  id: string;
  category: string;
  label: string;
  profileKey: keyof CompetitorProfile | string;
  format: CellFormat;
  source: DataSource;
  tooltip?: string;
  hidden?: boolean;
}

// ═══════════════════════════════════════════
// COMPETITOR PROFILE INTERFACE
// ═══════════════════════════════════════════

export interface CompetitorProfile {
  // ─── Identity / Business Profile ───
  domain: string;
  businessName: string | null;
  domainAge: number | null;
  valueProposition: string | null;
  employeeCountEstimate: string | null;
  blogUrl: string | null;
  firstSeenDate: string | null;
  similarSites: string[] | null;

  // ─── Search Visibility ───
  estimatedOrganicTraffic: number | null;
  trafficTrend30d: number | null;
  totalRankingKeywords: number | null;
  keywordsInTop3: number | null;
  keywordsInTop10: number | null;
  keywordsInTop20: number | null;
  keywordsInTop8: number | null;
  avgOrganicPosition: number | null;
  brandedTrafficPct: number | null;
  brandedSearchVolume: number | null;
  shareOfVoice: number | null;
  keywordOverlapPct: number | null;
  serpFeatureCount: number | null;
  keywordIntentDistribution: Record<string, number> | null;
  featuredSnippetCount: number | null;
  hasKnowledgePanel: boolean | null;
  monthlyGrowthRate: number | null;
  topGrowingKeywords: string[] | null;
  googleIndexedPages: number | null;
  seTraffic: number | null;
  seTrafficCost: number | null;
  pagesIndexed: number | null;
  topKeywords: Array<{ keyword: string; position: number | null; volume: number | null; source: string }> | null;

  // ─── Content Depth & Quality ───
  totalIndexablePages: number | null;
  avgContentLength: number | null;
  avgWordsPerArticle: number | null;
  contentFreshnessScore: number | null;
  topicCoverageBreadth: number | null;
  contentEfficiency: number | null;
  duplicateContentPct: number | null;
  thinContentPct: number | null;
  schemaCoveragePct: number | null;
  faqHowToCount: number | null;
  blogPostsPerMonth: number | null;
  recentNewPages: number | null;
  averagePageAge: number | null;
  contentVelocityTrend: number | null;
  contentTypeBreakdown: string | null;
  contentTypeDistribution: Record<string, number> | null;
  avgImagesPerArticle: number | null;
  embedsVideoInArticles: boolean | null;
  isActivelyBlogging: boolean | null;
  contentQualityAssessment: string | null;
  topContentTypeByShares: string | null;
  avgInternalLinksPerPage: number | null;
  topNavItemCount: number | null;
  productPageAvgWordCount: number | null;
  avgRefDomainsToContentPages: number | null;

  // ─── Authority & Links ───
  domainAuthority: number | null;
  urlRating: number | null;
  referringDomains: number | null;
  totalBacklinks: number | null;
  linkVelocity60d: number | null;
  backlinkQualityScore: number | null;
  commonBacklinkDomains: number | null;
  overallSeoScore: number | null;
  ahrefsDR: number | null;
  mozDA: number | null;
  mozPA: number | null;
  mozSpamScore: number | null;
  majesticTrustFlow: number | null;
  majesticCitationFlow: number | null;

  // ─── Technical Health ───
  techHealthScore: number | null;
  cwvPassRate: number | null;
  siteSpeedScore: number | null;
  mobileFriendlinessScore: number | null;
  securityGrade: string | null;
  crawlabilityScore: number | null;
  jsRenderDependencyPct: number | null;
  cdnProvider: string | null;
  hostingProvider: string | null;
  emailProvider: string | null;
  cmsType: string | null;
  techStackSignals: string[];
  onPageSeoQuality: string | null;
  hasSchemaOnProducts: boolean | null;
  hasTargetedLandingPages: boolean | null;

  // ─── AI Discoverability ───
  avgGeoScore: number | null;
  avgCitationWorthiness: number | null;
  hasLlmsTxt: boolean | null;
  aiBotAccessPolicy: string | null;
  passageReadyPct: number | null;
  featuredSnippetReadyPct: number | null;

  // ─── User Experience & Conversion ───
  avgBounceRate: number | null;
  avgSessionDuration: number | null;
  pagesPerVisit: number | null;
  conversionPathCount: number | null;
  ctaDensityScore: number | null;
  emailOptInQuality: string | null;
  optInOffer: string | null;
  hasEmailOptIn: boolean | null;
  trustSignalScore: number | null;
  hasLiveChat: boolean | null;
  hasFreeTrial: boolean | null;
  pricingModel: string | null;
  trafficSourcesBreakdown: Record<string, number> | null;

  // ─── Social Media ───
  facebookUrl: string | null;
  facebookFans: number | null;
  facebookUpdatesPerMonth: number | null;
  facebookEngagementLevel: string | null;
  facebookCreatesVideo: boolean | null;
  facebookAvgVideoViews: number | null;
  twitterUrl: string | null;
  twitterFollowers: number | null;
  twitterUpdatesPerMonth: number | null;
  instagramUrl: string | null;
  instagramFollowers: number | null;
  instagramAvgImageLikes: number | null;
  instagramAvgVideoViews: number | null;
  youtubeUrl: string | null;
  youtubeVideoCount: number | null;
  youtubeSubscribers: number | null;
  youtubeVideosOver100Views: number | null;
  youtubeUpdatesPerMonth: number | null;
  linkedinUrl: string | null;
  linkedinFollowers: number | null;
  tiktokUrl: string | null;
  tiktokFollowers: number | null;
  socialTotalFollowers: number | null;
  socialGrowthRate: number | null;

  // ─── Paid & Advertising ───
  adsTraffic: number | null;
  adsTrafficCost: number | null;
  displayAdsCount: number | null;
  ppcKeywordsCount: number | null;
  adPlatformsDetected: string[] | null;
  hasConversionTracking: boolean | null;
  hasRemarketingTags: boolean | null;

  // ─── E-commerce & Pricing ───
  offersSameProducts: boolean | null;
  pricingComparison: string | null;
  shippingOffers: string | null;

  // ─── Local SEO ───
  localKeywordRanking: number | null;
  reviewCount: number | null;
  imageCount: number | null;
  localPressCoverage: boolean | null;
  qualityCitationsPresent: boolean | null;
  hasOptimizedLocalPages: boolean | null;

  // ─── Reviews & Reputation ───
  trustpilotScore: number | null;
  trustpilotReviewCount: number | null;
  g2Rating: number | null;
  g2ReviewCount: number | null;
  capterraRating: number | null;
  capterraReviewCount: number | null;
  googleReviewScore: number | null;
  googleReviewCount: number | null;
  aggregateReviewScore: number | null;
  aggregateReviewCount: number | null;
  reviewScoreAvg: number | null;
  brandMentionCount: number | null;

  // ─── Top Content ───
  topBlogPages: Array<{ url: string; title: string; traffic?: number }>;
  topEcomPages: Array<{ url: string; title: string; traffic?: number }>;
  topContentShareCounts: Array<{ url: string; shares: number }>;
  topOrganicPages: Array<{ url: string; title: string; traffic?: number }>;

  // ─── Threat & Opportunity ───
  threatLevel: string | null;
  contentThreatScore: number | null;
  authorityThreatScore: number | null;
  innovationThreatScore: number | null;
  opportunityAgainstThem: number | null;

  // ─── Infrastructure (backend-only, shown in charts/sidebar) ───
  historicalGrowthCurve: Array<{ year: number; pages: number }> | null;

  // ─── Data Quality Tracking ───
  dataSourcesUsed: string[] | null;
  dataConfidence: 'high' | 'medium' | 'low' | null;
  lastEnrichmentPhase: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | null;

  // ─── Meta ───
  _meta: {
    crawledAt: number | null;
    aiAnalyzedAt: number | null;
    manualEditedAt: number | null;
    pagesCrawled: number;
    source: 'micro-crawl' | 'full-crawl' | 'manual' | 'imported' | 'enriched';
  };
}

// ═══════════════════════════════════════════
// CATEGORIES
// ═══════════════════════════════════════════

export const COMPARISON_CATEGORIES = [
  'Business Profile',
  'Search Visibility',
  'Content',
  'Authority & Links',
  'Technical Health',
  'AI Discoverability',
  'User Experience & Conversion',
  'Social Media',
  'Paid & Advertising',
  'Reviews & Reputation',
  'E-commerce & Pricing',
  'Local SEO',
  'Top Pages',
  'Threat & Opportunity',
] as const;

// ═══════════════════════════════════════════
// COMPARISON ROWS
// ═══════════════════════════════════════════

export const COMPARISON_ROWS: ComparisonRowDef[] = [
  { id: 'bp-domain', category: 'Business Profile', label: 'Domain', profileKey: 'domain', format: 'url', source: 'crawl' },
  { id: 'bp-name', category: 'Business Profile', label: 'Business Name', profileKey: 'businessName', format: 'text', source: 'ai' },
  { id: 'bp-age', category: 'Business Profile', label: 'Domain Age (years)', profileKey: 'domainAge', format: 'number', source: 'dns', tooltip: 'RDAP registration date or Wayback first capture' },
  { id: 'bp-value-prop', category: 'Business Profile', label: 'Value Proposition', profileKey: 'valueProposition', format: 'text', source: 'ai' },
  { id: 'bp-employees', category: 'Business Profile', label: 'Employee Estimate', profileKey: 'employeeCountEstimate', format: 'text', source: 'ai' },
  { id: 'bp-cms', category: 'Business Profile', label: 'CMS Platform', profileKey: 'cmsType', format: 'text', source: 'crawl' },
  { id: 'bp-pricing', category: 'Business Profile', label: 'Pricing Model', profileKey: 'pricingModel', format: 'text', source: 'ai' },
  { id: 'bp-first-seen', category: 'Business Profile', label: 'First Seen', profileKey: 'firstSeenDate', format: 'text', source: 'dns', tooltip: 'Wayback or RDAP first seen date' },

  { id: 'sv-organic-traffic', category: 'Search Visibility', label: 'Est. Organic Traffic', profileKey: 'estimatedOrganicTraffic', format: 'number', source: 'external' },
  { id: 'sv-traffic-trend', category: 'Search Visibility', label: 'Traffic Trend (30d %)', profileKey: 'trafficTrend30d', format: 'number', source: 'external', tooltip: '+ growing, - declining' },
  { id: 'sv-total-kw', category: 'Search Visibility', label: 'Total Ranking Keywords', profileKey: 'totalRankingKeywords', format: 'number', source: 'external' },
  { id: 'sv-kw-top3', category: 'Search Visibility', label: 'Keywords in Top 3', profileKey: 'keywordsInTop3', format: 'number', source: 'external' },
  { id: 'sv-kw-top10', category: 'Search Visibility', label: 'Keywords in Top 10', profileKey: 'keywordsInTop10', format: 'number', source: 'external' },
  { id: 'sv-kw-top20', category: 'Search Visibility', label: 'Keywords in Top 20', profileKey: 'keywordsInTop20', format: 'number', source: 'external' },
  { id: 'sv-avg-pos', category: 'Search Visibility', label: 'Avg Organic Position', profileKey: 'avgOrganicPosition', format: 'number', source: 'external' },
  { id: 'sv-branded-pct', category: 'Search Visibility', label: 'Branded Traffic %', profileKey: 'brandedTrafficPct', format: 'number', source: 'external' },
  { id: 'sv-branded-vol', category: 'Search Visibility', label: 'Branded Search Volume', profileKey: 'brandedSearchVolume', format: 'number', source: 'external' },
  { id: 'sv-sov', category: 'Search Visibility', label: 'Share of Voice', profileKey: 'shareOfVoice', format: 'score_100', source: 'computed' },
  { id: 'sv-keyword-overlap', category: 'Search Visibility', label: 'Keyword Overlap %', profileKey: 'keywordOverlapPct', format: 'number', source: 'computed' },
  { id: 'sv-serp-features', category: 'Search Visibility', label: 'SERP Features Owned', profileKey: 'serpFeatureCount', format: 'number', source: 'crawl' },
  { id: 'sv-snippets', category: 'Search Visibility', label: 'Featured Snippets', profileKey: 'featuredSnippetCount', format: 'number', source: 'crawl' },
  { id: 'sv-knowledge-panel', category: 'Search Visibility', label: 'Has Knowledge Panel?', profileKey: 'hasKnowledgePanel', format: 'boolean', source: 'external' },
  { id: 'sv-indexed', category: 'Search Visibility', label: 'Google Indexed Pages', profileKey: 'googleIndexedPages', format: 'number', source: 'external' },
  { id: 'sv-mom-growth', category: 'Search Visibility', label: 'Monthly Growth Rate %', profileKey: 'monthlyGrowthRate', format: 'number', source: 'external' },

  { id: 'ct-total-pages', category: 'Content', label: 'Total Indexable Pages', profileKey: 'totalIndexablePages', format: 'number', source: 'sitemap' },
  { id: 'ct-avg-words', category: 'Content', label: 'Avg Words Per Page', profileKey: 'avgContentLength', format: 'number', source: 'crawl' },
  { id: 'ct-content-types', category: 'Content', label: 'Content Type Breakdown', profileKey: 'contentTypeBreakdown', format: 'text', source: 'crawl' },
  { id: 'ct-blog-active', category: 'Content', label: 'Actively Blogging?', profileKey: 'isActivelyBlogging', format: 'boolean', source: 'sitemap' },
  { id: 'ct-posts-month', category: 'Content', label: 'Blog Posts Per Month', profileKey: 'blogPostsPerMonth', format: 'number', source: 'sitemap' },
  { id: 'ct-quality', category: 'Content', label: 'Content Quality', profileKey: 'contentQualityAssessment', format: 'text', source: 'ai' },
  { id: 'ct-freshness', category: 'Content', label: 'Content Freshness Score', profileKey: 'contentFreshnessScore', format: 'score_100', source: 'sitemap' },
  { id: 'ct-velocity-trend', category: 'Content', label: 'Publishing Velocity Trend %', profileKey: 'contentVelocityTrend', format: 'number', source: 'sitemap' },
  { id: 'ct-topics', category: 'Content', label: 'Topic Clusters', profileKey: 'topicCoverageBreadth', format: 'number', source: 'crawl' },
  { id: 'ct-efficiency', category: 'Content', label: 'Content Efficiency', profileKey: 'contentEfficiency', format: 'number', source: 'computed', tooltip: 'Traffic per indexable page' },
  { id: 'ct-duplicate-pct', category: 'Content', label: 'Duplicate Content %', profileKey: 'duplicateContentPct', format: 'number', source: 'crawl' },
  { id: 'ct-thin-pct', category: 'Content', label: 'Thin Content %', profileKey: 'thinContentPct', format: 'number', source: 'crawl' },
  { id: 'ct-schema-pct', category: 'Content', label: 'Schema Coverage %', profileKey: 'schemaCoveragePct', format: 'number', source: 'crawl' },
  { id: 'ct-faq-count', category: 'Content', label: 'FAQ / How-To Pages', profileKey: 'faqHowToCount', format: 'number', source: 'crawl' },
  { id: 'ct-avg-images', category: 'Content', label: 'Avg Images Per Article', profileKey: 'avgImagesPerArticle', format: 'number', source: 'crawl' },
  { id: 'ct-embeds-video', category: 'Content', label: 'Uses Video in Articles?', profileKey: 'embedsVideoInArticles', format: 'boolean', source: 'crawl' },
  { id: 'ct-avg-internal-links', category: 'Content', label: 'Avg Internal Links Per Page', profileKey: 'avgInternalLinksPerPage', format: 'number', source: 'crawl' },
  { id: 'ct-nav-items', category: 'Content', label: 'Top Nav Items', profileKey: 'topNavItemCount', format: 'number', source: 'crawl' },

  { id: 'al-seo-score', category: 'Authority & Links', label: 'Overall SEO Score', profileKey: 'overallSeoScore', format: 'score_100', source: 'computed' },
  { id: 'al-ahrefs-dr', category: 'Authority & Links', label: 'Ahrefs DR', profileKey: 'ahrefsDR', format: 'score_100', source: 'external' },
  { id: 'al-moz-da', category: 'Authority & Links', label: 'Moz DA', profileKey: 'mozDA', format: 'score_100', source: 'external' },
  { id: 'al-trust-flow', category: 'Authority & Links', label: 'Trust Flow', profileKey: 'majesticTrustFlow', format: 'score_100', source: 'external' },
  { id: 'al-citation-flow', category: 'Authority & Links', label: 'Citation Flow', profileKey: 'majesticCitationFlow', format: 'score_100', source: 'external' },
  { id: 'al-spam-score', category: 'Authority & Links', label: 'Spam Score', profileKey: 'mozSpamScore', format: 'number', source: 'external', tooltip: 'Lower is better (0-100)' },
  { id: 'al-rd', category: 'Authority & Links', label: 'Referring Domains', profileKey: 'referringDomains', format: 'number', source: 'external' },
  { id: 'al-backlinks', category: 'Authority & Links', label: 'Total Backlinks', profileKey: 'totalBacklinks', format: 'number', source: 'external' },
  { id: 'al-velocity', category: 'Authority & Links', label: 'Link Velocity (60d)', profileKey: 'linkVelocity60d', format: 'number', source: 'external' },
  { id: 'al-quality', category: 'Authority & Links', label: 'Backlink Quality Score', profileKey: 'backlinkQualityScore', format: 'score_100', source: 'computed' },
  { id: 'al-common', category: 'Authority & Links', label: 'Common Linking Domains', profileKey: 'commonBacklinkDomains', format: 'number', source: 'computed' },
  { id: 'al-avg-rd-content', category: 'Authority & Links', label: 'Avg RD to Content Pages', profileKey: 'avgRefDomainsToContentPages', format: 'number', source: 'computed' },

  { id: 'th-score', category: 'Technical Health', label: 'Tech Health Score', profileKey: 'techHealthScore', format: 'score_100', source: 'computed' },
  { id: 'th-speed', category: 'Technical Health', label: 'Site Speed Score', profileKey: 'siteSpeedScore', format: 'score_100', source: 'psi' },
  { id: 'th-cwv', category: 'Technical Health', label: 'Core Web Vitals Pass %', profileKey: 'cwvPassRate', format: 'number', source: 'psi' },
  { id: 'th-mobile', category: 'Technical Health', label: 'Mobile Friendliness', profileKey: 'mobileFriendlinessScore', format: 'score_100', source: 'psi' },
  { id: 'th-crawlability', category: 'Technical Health', label: 'Crawlability Score', profileKey: 'crawlabilityScore', format: 'score_100', source: 'crawl' },
  { id: 'th-security', category: 'Technical Health', label: 'Security Grade', profileKey: 'securityGrade', format: 'text', source: 'crawl' },
  { id: 'th-js-dep', category: 'Technical Health', label: 'JS Render Dependency %', profileKey: 'jsRenderDependencyPct', format: 'number', source: 'crawl' },
  { id: 'th-cdn', category: 'Technical Health', label: 'CDN Provider', profileKey: 'cdnProvider', format: 'text', source: 'dns' },
  { id: 'th-hosting', category: 'Technical Health', label: 'Hosting Provider', profileKey: 'hostingProvider', format: 'text', source: 'dns' },
  { id: 'th-email', category: 'Technical Health', label: 'Email Provider', profileKey: 'emailProvider', format: 'text', source: 'dns' },
  { id: 'th-tech-stack', category: 'Technical Health', label: 'Tech Stack', profileKey: 'techStackSignals', format: 'list', source: 'crawl' },
  { id: 'th-seo-quality', category: 'Technical Health', label: 'On-Page SEO Quality', profileKey: 'onPageSeoQuality', format: 'text', source: 'crawl' },

  { id: 'ai-geo', category: 'AI Discoverability', label: 'Avg GEO Score', profileKey: 'avgGeoScore', format: 'score_100', source: 'ai' },
  { id: 'ai-citation', category: 'AI Discoverability', label: 'Avg Citation Worthiness', profileKey: 'avgCitationWorthiness', format: 'score_100', source: 'ai' },
  { id: 'ai-llms-txt', category: 'AI Discoverability', label: 'llms.txt Present?', profileKey: 'hasLlmsTxt', format: 'boolean', source: 'crawl' },
  { id: 'ai-bot-policy', category: 'AI Discoverability', label: 'AI Bot Access Policy', profileKey: 'aiBotAccessPolicy', format: 'text', source: 'crawl' },
  { id: 'ai-passage-pct', category: 'AI Discoverability', label: 'Passage-Ready Content %', profileKey: 'passageReadyPct', format: 'number', source: 'crawl' },
  { id: 'ai-snippet-pct', category: 'AI Discoverability', label: 'Featured Snippet Ready %', profileKey: 'featuredSnippetReadyPct', format: 'number', source: 'crawl' },

  { id: 'ux-bounce', category: 'User Experience & Conversion', label: 'Avg Bounce Rate %', profileKey: 'avgBounceRate', format: 'number', source: 'external' },
  { id: 'ux-session', category: 'User Experience & Conversion', label: 'Avg Session Duration (s)', profileKey: 'avgSessionDuration', format: 'number', source: 'external' },
  { id: 'ux-ppv', category: 'User Experience & Conversion', label: 'Pages Per Visit', profileKey: 'pagesPerVisit', format: 'number', source: 'external' },
  { id: 'ux-conv-paths', category: 'User Experience & Conversion', label: 'Conversion Paths', profileKey: 'conversionPathCount', format: 'number', source: 'crawl' },
  { id: 'ux-cta', category: 'User Experience & Conversion', label: 'CTA Density Score', profileKey: 'ctaDensityScore', format: 'score_100', source: 'crawl' },
  { id: 'ux-trust', category: 'User Experience & Conversion', label: 'Trust Signal Score', profileKey: 'trustSignalScore', format: 'score_100', source: 'crawl' },
  { id: 'ux-optin', category: 'User Experience & Conversion', label: 'Email Opt-In Quality', profileKey: 'emailOptInQuality', format: 'text', source: 'crawl' },
  { id: 'ux-optin-offer', category: 'User Experience & Conversion', label: 'Opt-In Offer', profileKey: 'optInOffer', format: 'text', source: 'ai' },
  { id: 'ux-live-chat', category: 'User Experience & Conversion', label: 'Live Chat / Chatbot?', profileKey: 'hasLiveChat', format: 'boolean', source: 'crawl' },
  { id: 'ux-free-trial', category: 'User Experience & Conversion', label: 'Free Trial / Freemium?', profileKey: 'hasFreeTrial', format: 'boolean', source: 'crawl' },
  { id: 'ux-pricing-model', category: 'User Experience & Conversion', label: 'Pricing Model', profileKey: 'pricingModel', format: 'text', source: 'ai' },

  { id: 'social-total', category: 'Social Media', label: 'Total Followers', profileKey: 'socialTotalFollowers', format: 'number', source: 'computed' },
  { id: 'social-growth', category: 'Social Media', label: 'Social Growth Rate %', profileKey: 'socialGrowthRate', format: 'number', source: 'computed' },
  { id: 'fb-url', category: 'Social Media', label: 'Facebook URL', profileKey: 'facebookUrl', format: 'url', source: 'crawl' },
  { id: 'fb-fans', category: 'Social Media', label: 'Facebook Fans', profileKey: 'facebookFans', format: 'number', source: 'social_api' },
  { id: 'fb-posts', category: 'Social Media', label: 'Facebook Posts/Mo', profileKey: 'facebookUpdatesPerMonth', format: 'number', source: 'social_api' },
  { id: 'fb-engagement', category: 'Social Media', label: 'Facebook Engagement', profileKey: 'facebookEngagementLevel', format: 'text', source: 'social_api' },
  { id: 'tw-url', category: 'Social Media', label: 'X (Twitter) URL', profileKey: 'twitterUrl', format: 'url', source: 'crawl' },
  { id: 'tw-followers', category: 'Social Media', label: 'X Followers', profileKey: 'twitterFollowers', format: 'number', source: 'social_api' },
  { id: 'tw-posts', category: 'Social Media', label: 'X Posts/Mo', profileKey: 'twitterUpdatesPerMonth', format: 'number', source: 'social_api' },
  { id: 'ig-url', category: 'Social Media', label: 'Instagram URL', profileKey: 'instagramUrl', format: 'url', source: 'crawl' },
  { id: 'ig-followers', category: 'Social Media', label: 'Instagram Followers', profileKey: 'instagramFollowers', format: 'number', source: 'social_api' },
  { id: 'ig-likes', category: 'Social Media', label: 'Instagram Avg Likes', profileKey: 'instagramAvgImageLikes', format: 'number', source: 'social_api' },
  { id: 'yt-url', category: 'Social Media', label: 'YouTube URL', profileKey: 'youtubeUrl', format: 'url', source: 'crawl' },
  { id: 'yt-subs', category: 'Social Media', label: 'YouTube Subscribers', profileKey: 'youtubeSubscribers', format: 'number', source: 'social_api' },
  { id: 'yt-videos', category: 'Social Media', label: 'YouTube Videos', profileKey: 'youtubeVideoCount', format: 'number', source: 'social_api' },
  { id: 'yt-posts', category: 'Social Media', label: 'YouTube Uploads/Mo', profileKey: 'youtubeUpdatesPerMonth', format: 'number', source: 'social_api' },
  { id: 'li-url', category: 'Social Media', label: 'LinkedIn URL', profileKey: 'linkedinUrl', format: 'url', source: 'crawl' },
  { id: 'li-followers', category: 'Social Media', label: 'LinkedIn Followers', profileKey: 'linkedinFollowers', format: 'number', source: 'social_api' },
  { id: 'tt-url', category: 'Social Media', label: 'TikTok URL', profileKey: 'tiktokUrl', format: 'url', source: 'crawl' },
  { id: 'tt-followers', category: 'Social Media', label: 'TikTok Followers', profileKey: 'tiktokFollowers', format: 'number', source: 'social_api' },

  { id: 'paid-traffic', category: 'Paid & Advertising', label: 'Est. PPC Clicks/Mo', profileKey: 'adsTraffic', format: 'number', source: 'external' },
  { id: 'paid-cost', category: 'Paid & Advertising', label: 'Est. Ad Budget/Mo', profileKey: 'adsTrafficCost', format: 'currency', source: 'external' },
  { id: 'paid-kw', category: 'Paid & Advertising', label: 'PPC Keywords Count', profileKey: 'ppcKeywordsCount', format: 'number', source: 'external' },
  { id: 'paid-display', category: 'Paid & Advertising', label: 'Display Ads Count', profileKey: 'displayAdsCount', format: 'number', source: 'crawl' },
  { id: 'paid-platforms', category: 'Paid & Advertising', label: 'Ad Platforms Detected', profileKey: 'adPlatformsDetected', format: 'list', source: 'crawl' },
  { id: 'paid-conversion', category: 'Paid & Advertising', label: 'Conversion Tracking?', profileKey: 'hasConversionTracking', format: 'boolean', source: 'crawl' },
  { id: 'paid-remarketing', category: 'Paid & Advertising', label: 'Remarketing Tags?', profileKey: 'hasRemarketingTags', format: 'boolean', source: 'crawl' },

  { id: 'rv-aggregate-score', category: 'Reviews & Reputation', label: 'Overall Review Score', profileKey: 'aggregateReviewScore', format: 'rating_5', source: 'computed' },
  { id: 'rv-aggregate-count', category: 'Reviews & Reputation', label: 'Total Reviews', profileKey: 'aggregateReviewCount', format: 'number', source: 'computed' },
  { id: 'rv-trustpilot', category: 'Reviews & Reputation', label: 'Trustpilot Score', profileKey: 'trustpilotScore', format: 'rating_5', source: 'external' },
  { id: 'rv-trustpilot-count', category: 'Reviews & Reputation', label: 'Trustpilot Reviews', profileKey: 'trustpilotReviewCount', format: 'number', source: 'external' },
  { id: 'rv-g2', category: 'Reviews & Reputation', label: 'G2 Rating', profileKey: 'g2Rating', format: 'rating_5', source: 'external' },
  { id: 'rv-g2-count', category: 'Reviews & Reputation', label: 'G2 Reviews', profileKey: 'g2ReviewCount', format: 'number', source: 'external' },
  { id: 'rv-capterra', category: 'Reviews & Reputation', label: 'Capterra Rating', profileKey: 'capterraRating', format: 'rating_5', source: 'external' },
  { id: 'rv-capterra-count', category: 'Reviews & Reputation', label: 'Capterra Reviews', profileKey: 'capterraReviewCount', format: 'number', source: 'external' },
  { id: 'rv-google', category: 'Reviews & Reputation', label: 'Google Rating', profileKey: 'googleReviewScore', format: 'rating_5', source: 'external' },
  { id: 'rv-google-count', category: 'Reviews & Reputation', label: 'Google Reviews', profileKey: 'googleReviewCount', format: 'number', source: 'external' },
  { id: 'rv-brand-mentions', category: 'Reviews & Reputation', label: 'Unlinked Brand Mentions', profileKey: 'brandMentionCount', format: 'number', source: 'ai' },
  { id: 'rv-landing-pages', category: 'Reviews & Reputation', label: 'Targeted Landing Pages?', profileKey: 'hasTargetedLandingPages', format: 'boolean', source: 'crawl' },

  { id: 'ec-same-products', category: 'E-commerce & Pricing', label: 'Same Products/Services?', profileKey: 'offersSameProducts', format: 'boolean', source: 'ai' },
  { id: 'ec-pricing', category: 'E-commerce & Pricing', label: 'Pricing Comparison', profileKey: 'pricingComparison', format: 'text', source: 'ai' },
  { id: 'ec-shipping', category: 'E-commerce & Pricing', label: 'Shipping Offers', profileKey: 'shippingOffers', format: 'text', source: 'ai' },
  { id: 'ec-product-words', category: 'E-commerce & Pricing', label: 'Product Page Avg Words', profileKey: 'productPageAvgWordCount', format: 'number', source: 'crawl' },
  { id: 'ec-product-schema', category: 'E-commerce & Pricing', label: 'Schema on Products?', profileKey: 'hasSchemaOnProducts', format: 'boolean', source: 'crawl' },

  { id: 'loc-rank', category: 'Local SEO', label: 'Local Keyword Ranking', profileKey: 'localKeywordRanking', format: 'number', source: 'external' },
  { id: 'loc-reviews', category: 'Local SEO', label: 'Google Review Count', profileKey: 'reviewCount', format: 'number', source: 'external' },
  { id: 'loc-images', category: 'Local SEO', label: 'GMB Images', profileKey: 'imageCount', format: 'number', source: 'external' },
  { id: 'loc-press', category: 'Local SEO', label: 'Local Press Coverage?', profileKey: 'localPressCoverage', format: 'boolean', source: 'external' },
  { id: 'loc-citations', category: 'Local SEO', label: 'Quality Citations?', profileKey: 'qualityCitationsPresent', format: 'boolean', source: 'external' },
  { id: 'loc-pages', category: 'Local SEO', label: 'Optimized Local Pages?', profileKey: 'hasOptimizedLocalPages', format: 'boolean', source: 'crawl' },

  { id: 'tp-organic-1', category: 'Top Pages', label: 'Top Organic Page #1', profileKey: 'topOrganicPages.0.url', format: 'url', source: 'external' },
  { id: 'tp-organic-2', category: 'Top Pages', label: 'Top Organic Page #2', profileKey: 'topOrganicPages.1.url', format: 'url', source: 'external' },
  { id: 'tp-organic-3', category: 'Top Pages', label: 'Top Organic Page #3', profileKey: 'topOrganicPages.2.url', format: 'url', source: 'external' },
  { id: 'tp-blog-1', category: 'Top Pages', label: 'Top Blog Page #1', profileKey: 'topBlogPages.0.url', format: 'url', source: 'crawl' },
  { id: 'tp-blog-2', category: 'Top Pages', label: 'Top Blog Page #2', profileKey: 'topBlogPages.1.url', format: 'url', source: 'crawl' },
  { id: 'tp-blog-3', category: 'Top Pages', label: 'Top Blog Page #3', profileKey: 'topBlogPages.2.url', format: 'url', source: 'crawl' },
  { id: 'tp-ecom-1', category: 'Top Pages', label: 'Top Product Page #1', profileKey: 'topEcomPages.0.url', format: 'url', source: 'crawl' },
  { id: 'tp-ecom-2', category: 'Top Pages', label: 'Top Product Page #2', profileKey: 'topEcomPages.1.url', format: 'url', source: 'crawl' },
  { id: 'tp-ecom-3', category: 'Top Pages', label: 'Top Product Page #3', profileKey: 'topEcomPages.2.url', format: 'url', source: 'crawl' },

  { id: 'to-threat-level', category: 'Threat & Opportunity', label: 'Overall Threat Level', profileKey: 'threatLevel', format: 'text', source: 'computed' },
  { id: 'to-content-threat', category: 'Threat & Opportunity', label: 'Content Threat Score', profileKey: 'contentThreatScore', format: 'score_100', source: 'computed' },
  { id: 'to-authority-threat', category: 'Threat & Opportunity', label: 'Authority Threat Score', profileKey: 'authorityThreatScore', format: 'score_100', source: 'computed' },
  { id: 'to-innovation-threat', category: 'Threat & Opportunity', label: 'Innovation Threat Score', profileKey: 'innovationThreatScore', format: 'score_100', source: 'computed' },
  { id: 'to-opportunity', category: 'Threat & Opportunity', label: 'Opportunity Score', profileKey: 'opportunityAgainstThem', format: 'score_100', source: 'computed' },
];

// ═══════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════

export function getProfileValue(profile: CompetitorProfile, dotPath: string): any {
  if (!profile || !dotPath) return null;
  const parts = dotPath.split('.');
  let current: any = profile;
  for (const part of parts) {
    if (current === null || current === undefined) return null;
    current = current[part];
  }
  return current;
}

export function createEmptyProfile(domain: string): CompetitorProfile {
  return {
    domain,
    businessName: null,
    domainAge: null,
    valueProposition: null,
    employeeCountEstimate: null,
    blogUrl: null,
    firstSeenDate: null,
    similarSites: null,
    estimatedOrganicTraffic: null,
    trafficTrend30d: null,
    totalRankingKeywords: null,
    keywordsInTop3: null,
    keywordsInTop10: null,
    keywordsInTop20: null,
    keywordsInTop8: null,
    avgOrganicPosition: null,
    brandedTrafficPct: null,
    brandedSearchVolume: null,
    shareOfVoice: null,
    keywordOverlapPct: null,
    serpFeatureCount: null,
    keywordIntentDistribution: null,
    featuredSnippetCount: null,
    hasKnowledgePanel: null,
    monthlyGrowthRate: null,
    topGrowingKeywords: null,
    googleIndexedPages: null,
    seTraffic: null,
    seTrafficCost: null,
    pagesIndexed: null,
    topKeywords: null,
    totalIndexablePages: null,
    avgContentLength: null,
    avgWordsPerArticle: null,
    contentFreshnessScore: null,
    topicCoverageBreadth: null,
    contentEfficiency: null,
    duplicateContentPct: null,
    thinContentPct: null,
    schemaCoveragePct: null,
    faqHowToCount: null,
    blogPostsPerMonth: null,
    recentNewPages: null,
    averagePageAge: null,
    contentVelocityTrend: null,
    contentTypeBreakdown: null,
    contentTypeDistribution: null,
    avgImagesPerArticle: null,
    embedsVideoInArticles: null,
    isActivelyBlogging: null,
    contentQualityAssessment: null,
    topContentTypeByShares: null,
    avgInternalLinksPerPage: null,
    topNavItemCount: null,
    productPageAvgWordCount: null,
    avgRefDomainsToContentPages: null,
    domainAuthority: null,
    urlRating: null,
    referringDomains: null,
    totalBacklinks: null,
    linkVelocity60d: null,
    backlinkQualityScore: null,
    commonBacklinkDomains: null,
    overallSeoScore: null,
    ahrefsDR: null,
    mozDA: null,
    mozPA: null,
    mozSpamScore: null,
    majesticTrustFlow: null,
    majesticCitationFlow: null,
    techHealthScore: null,
    cwvPassRate: null,
    siteSpeedScore: null,
    mobileFriendlinessScore: null,
    securityGrade: null,
    crawlabilityScore: null,
    jsRenderDependencyPct: null,
    cdnProvider: null,
    hostingProvider: null,
    emailProvider: null,
    cmsType: null,
    techStackSignals: [],
    onPageSeoQuality: null,
    hasSchemaOnProducts: null,
    hasTargetedLandingPages: null,
    avgGeoScore: null,
    avgCitationWorthiness: null,
    hasLlmsTxt: null,
    aiBotAccessPolicy: null,
    passageReadyPct: null,
    featuredSnippetReadyPct: null,
    avgBounceRate: null,
    avgSessionDuration: null,
    pagesPerVisit: null,
    conversionPathCount: null,
    ctaDensityScore: null,
    emailOptInQuality: null,
    optInOffer: null,
    hasEmailOptIn: null,
    trustSignalScore: null,
    hasLiveChat: null,
    hasFreeTrial: null,
    pricingModel: null,
    trafficSourcesBreakdown: null,
    facebookUrl: null,
    facebookFans: null,
    facebookUpdatesPerMonth: null,
    facebookEngagementLevel: null,
    facebookCreatesVideo: null,
    facebookAvgVideoViews: null,
    twitterUrl: null,
    twitterFollowers: null,
    twitterUpdatesPerMonth: null,
    instagramUrl: null,
    instagramFollowers: null,
    instagramAvgImageLikes: null,
    instagramAvgVideoViews: null,
    youtubeUrl: null,
    youtubeVideoCount: null,
    youtubeSubscribers: null,
    youtubeVideosOver100Views: null,
    youtubeUpdatesPerMonth: null,
    linkedinUrl: null,
    linkedinFollowers: null,
    tiktokUrl: null,
    tiktokFollowers: null,
    socialTotalFollowers: null,
    socialGrowthRate: null,
    adsTraffic: null,
    adsTrafficCost: null,
    displayAdsCount: null,
    ppcKeywordsCount: null,
    adPlatformsDetected: null,
    hasConversionTracking: null,
    hasRemarketingTags: null,
    offersSameProducts: null,
    pricingComparison: null,
    shippingOffers: null,
    localKeywordRanking: null,
    reviewCount: null,
    imageCount: null,
    localPressCoverage: null,
    qualityCitationsPresent: null,
    hasOptimizedLocalPages: null,
    trustpilotScore: null,
    trustpilotReviewCount: null,
    g2Rating: null,
    g2ReviewCount: null,
    capterraRating: null,
    capterraReviewCount: null,
    googleReviewScore: null,
    googleReviewCount: null,
    aggregateReviewScore: null,
    aggregateReviewCount: null,
    reviewScoreAvg: null,
    brandMentionCount: null,
    topBlogPages: [],
    topEcomPages: [],
    topContentShareCounts: [],
    topOrganicPages: [],
    threatLevel: null,
    contentThreatScore: null,
    authorityThreatScore: null,
    innovationThreatScore: null,
    opportunityAgainstThem: null,
    historicalGrowthCurve: null,
    dataSourcesUsed: null,
    dataConfidence: null,
    lastEnrichmentPhase: null,
    _meta: {
      crawledAt: null,
      aiAnalyzedAt: null,
      manualEditedAt: null,
      pagesCrawled: 0,
      source: 'micro-crawl',
    },
  };
}
