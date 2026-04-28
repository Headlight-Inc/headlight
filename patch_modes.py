import re
import os

base_dir = "packages/modes/src/definitions/"

modes = {
    "full-audit": """export const fullAuditLsSections: ReadonlyArray<SidebarSection> = [
	{
		id: 'kpi.pages', kind: 'kpi', label: 'Pages crawled',
		compute: ({ pages }) => ({ value: pages.length.toLocaleString() }),
	},
	{
		id: 'sessions', kind: 'list', label: 'Sessions', selectionMode: 'single', selectionKey: 'session.id', defaultOpen: true,
		items: [],  // resolved at runtime
		resolveItems: ({ pages }) => /* see SessionResolver in Foundation context */ [
			{ id: 'latest', label: 'Latest', meta: String(pages.length), icon: 'Clock' },
			{ id: 'compare', label: 'Compare sessions…', icon: 'Plus', action: 'compare' },
		],
	},
	{
		id: 'scope', kind: 'list', label: 'Scope', selectionMode: 'multi', selectionKey: 'scope.kind',
		items: [
			{ id: 'subdomains',     label: 'All subdomains',         icon: 'Globe' },
			{ id: 'paths',          label: 'Path patterns',          icon: 'Folder' },
			{ id: 'sitemap',        label: 'Sitemap-only',           icon: 'FileCode' },
			{ id: 'list',           label: 'URL list',               icon: 'List' },
		],
	},
	{
		id: 'severity', kind: 'facet', label: 'Severity', countKey: 'page.statusClass',
		buckets: [
			{ value: '2xx', label: '200 OK',         tone: 'good' },
			{ value: '3xx', label: '3xx Redirect',   tone: 'info' },
			{ value: '4xx', label: '4xx Error',      tone: 'bad'  },
			{ value: '5xx', label: '5xx Server',     tone: 'bad'  },
			{ value: 'unknown', label: 'Unknown',    tone: 'neutral' },
		],
	},
	{
		id: 'segments', kind: 'facet', label: 'Page category', countKey: 'page.category',
		buckets: [
			{ value: 'home',         label: 'Home' },
			{ value: 'article',      label: 'Article' },
			{ value: 'product',      label: 'Product' },
			{ value: 'category',     label: 'Category' },
			{ value: 'listing',      label: 'Listing' },
			{ value: 'landing',      label: 'Landing' },
			{ value: 'legal',        label: 'Legal' },
			{ value: 'general',      label: 'General' },
		],
		maxVisible: 8,
	},
	{
		id: 'depth', kind: 'facet', label: 'Click depth', countKey: 'page.depth',
		buckets: [
			{ value: '0-2', label: 'Depth 0–2', tone: 'good' },
			{ value: '3-4', label: 'Depth 3–4' },
			{ value: '5-6', label: 'Depth 5–6', tone: 'warn' },
			{ value: '7+',  label: 'Depth 7+',   tone: 'bad'  },
		],
	},
	{
		id: 'indexability', kind: 'facet', label: 'Indexability', countKey: 'page.indexability',
		buckets: [
			{ value: 'indexed',  label: 'Indexed',           tone: 'good' },
			{ value: 'blocked',  label: 'Blocked / Noindex', tone: 'warn' },
			{ value: 'redirect', label: 'Redirect',          tone: 'info' },
			{ value: 'error',    label: 'Error',             tone: 'bad'  },
		],
	},
	{
		id: 'savedViews', kind: 'saved-views', label: 'Saved views',
		defaultViews: [
			{ name: 'All errors',         mode: 'fullAudit', selections: { 'page.statusClass': ['4xx', '5xx'] } },
			{ name: 'Missing metadata',   mode: 'fullAudit', selections: { 'content.quality': ['thin'] } },
			{ name: 'Deep orphan pages',  mode: 'fullAudit', selections: { 'page.depth': ['5-6', '7+'] } },
		],
	},
];""",
    "wqa": """export const wqaLsSections: ReadonlyArray<SidebarSection> = [
	{ id: 'kpi.priority', kind: 'kpi', label: 'P0+P1 issues',
		compute: ({ pages }) => {
			const n = pages.filter((p: any) => p.priorityLevel === 1 || p.priorityLevel === 2).length;
			return { value: n, tone: n > 0 ? 'bad' : 'good' };
		},
	},
	{ id: 'sessions', kind: 'list', label: 'Sessions', selectionMode: 'single', selectionKey: 'session.id', defaultOpen: true,
		items: [],
		resolveItems: ({ pages }) => [
			{ id: 'latest', label: 'Latest', meta: String(pages.length), icon: 'Clock' },
			{ id: 'compare', label: 'Compare sessions…', icon: 'Plus', action: 'compare' },
		],
	},
	{ id: 'categories', kind: 'facet', label: 'Categories', countKey: 'page.category', bullet: 'arrow',
		buckets: [
			{ value: 'article',  label: 'Article' },
			{ value: 'product',  label: 'Product' },
			{ value: 'category', label: 'Category' },
			{ value: 'listing',  label: 'Listing' },
			{ value: 'landing',  label: 'Landing' },
			{ value: 'legal',    label: 'Legal' },
			{ value: 'general',  label: 'General', dim: () => true },
		],
	},
	{ id: 'priority', kind: 'facet', label: 'Priority tier', countKey: 'wqa.priority', bullet: 'dot',
		buckets: [
			{ value: 'P0', label: 'Critical',  tone: 'bad' },
			{ value: 'P1', label: 'High',      tone: 'warn' },
			{ value: 'P2', label: 'Medium' },
			{ value: 'P3', label: 'Low' },
			{ value: 'PS', label: 'Suppressed',   dim: () => true },
		],
	},

	{ id: 'issueTaxonomy', kind: 'facet', label: 'Issue taxonomy', countKey: 'issue.category', bullet: 'arrow',
		buckets: [
			{ value: 'Tech',        label: 'Tech' },
			{ value: 'Content',     label: 'Content' },
			{ value: 'Links',       label: 'Links' },
			{ value: 'Schema',      label: 'Schema' },
			{ value: 'Performance', label: 'Performance' },
		],
	},
	{ id: 'searchPerf', kind: 'facet', label: 'Search perf buckets', countKey: 'wqa.searchPerf', bullet: 'dot',
		buckets: [
			{ value: 'winners',       label: 'Winners ▲', tone: 'good' },
			{ value: 'losers',        label: 'Losers ▼',  tone: 'bad'  },
			{ value: 'stagnant',      label: 'Stagnant' },
			{ value: 'noImpressions', label: 'No impressions' },
		],
	},
	{ id: 'depth', kind: 'facet', label: 'Click depth', countKey: 'page.exactDepth', display: 'histogram',
		buckets: [
			{ value: '0', label: '0' },
			{ value: '1', label: '1' },
			{ value: '2', label: '2' },
			{ value: '3', label: '3' },
			{ value: '4', label: '4' },
			{ value: '5+', label: '5+' },
		],
		defaultOpen: true,
	},

	{ id: 'savedViews', kind: 'saved-views', label: 'Saved views',
		defaultViews: [
			{ name: 'P0+P1 catchable', mode: 'wqa', selections: { 'wqa.priority': ['P0', 'P1'], 'wqa.searchPerf': ['losers', 'stagnant'] } },
			{ name: 'Stale articles',  mode: 'wqa', selections: { 'page.category': ['article'], 'wqa.contentAge': ['stale'] } },
			{ name: 'Thin category',   mode: 'wqa', selections: { 'page.category': ['category'], 'content.quality': ['thin'] } },
		],
	},
];""",
    "technical": """export const technicalLsSections: ReadonlyArray<SidebarSection> = [
	{ id: 'sessions', kind: 'list', label: 'Sessions', selectionMode: 'single', selectionKey: 'session.id', items: [],
		resolveItems: ({ pages }) => [
			{ id: 'latest', label: 'Latest', meta: String(pages.length), icon: 'Clock' },
		],
	},
	{ id: 'rendering', kind: 'facet', label: 'Rendering', countKey: 'tech.rendering', bullet: 'check',
		buckets: [
			{ value: 'static',      label: 'Static' },
			{ value: 'ssr',         label: 'SSR' },
			{ value: 'csr-blocked', label: 'CSR-blocked', tone: 'bad' },
			{ value: 'hybrid',      label: 'Hybrid' },
		],
	},
	{ id: 'status', kind: 'facet', label: 'Status', countKey: 'page.statusClass', bullet: 'check',
		buckets: [
			{ value: '2xx',     label: '2xx',     tone: 'good' },
			{ value: '3xx',     label: '3xx',     tone: 'info' },
			{ value: '4xx',     label: '4xx',     tone: 'bad'  },
			{ value: '5xx',     label: '5xx',     tone: 'bad'  },
			{ value: 'timeout', label: 'Timeout', tone: 'bad'  },
		],
	},
	{ id: 'cwv', kind: 'facet', label: 'CWV (bucket)', countKey: 'tech.cwv', bullet: 'dot',
		buckets: [
			{ value: 'lcp-good',   label: 'LCP good',      tone: 'good' },
			{ value: 'lcp-warn',   label: 'LCP needs imp.', tone: 'warn' },
			{ value: 'lcp-poor',   label: 'LCP poor',      tone: 'bad'  },
			{ value: 'inp-poor',   label: 'INP poor',      tone: 'bad'  },
			{ value: 'cls-poor',   label: 'CLS poor',      tone: 'bad'  },
		],
	},
	{ id: 'security', kind: 'facet', label: 'Security', countKey: 'tech.security', bullet: 'check',
		buckets: [
			{ value: 'https',         label: 'HTTPS everywhere', tone: 'good' },
			{ value: 'hsts',          label: 'HSTS present',     tone: 'good' },
			{ value: 'csp-missing',   label: 'CSP missing',      tone: 'bad'  },
			{ value: 'mixed-content', label: 'Mixed content',    tone: 'bad'  },
			{ value: 'tls-1.2-only',  label: 'TLS 1.2 only',     tone: 'warn' },
		],
	},
	{ id: 'robots', kind: 'facet', label: 'Robots / Index', countKey: 'tech.robots', bullet: 'arrow',
		buckets: [
			{ value: 'allowed',          label: 'Allowed',          tone: 'good' },
			{ value: 'disallowed',       label: 'Disallowed',       tone: 'bad'  },
			{ value: 'noindex-meta',     label: 'Noindex meta',     tone: 'bad'  },
			{ value: 'x-robots-noindex', label: 'X-Robots noindex', tone: 'bad'  },
			{ value: 'not-in-sitemap',   label: 'Not in sitemap',   tone: 'warn' },
			{ value: 'hreflang-issues',  label: 'Hreflang issues',  tone: 'bad'  },
		],
	},
	{ id: 'a11y', kind: 'facet', label: 'Accessibility', countKey: 'tech.a11y', bullet: 'dot',
		buckets: [
			{ value: 'critical', label: 'Critical', tone: 'bad'  },
			{ value: 'serious',  label: 'Serious',  tone: 'bad'  },
			{ value: 'moderate', label: 'Moderate', tone: 'warn' },
			{ value: 'minor',    label: 'Minor',    tone: 'info' },
		],
	},
	{ id: 'savedViews', kind: 'saved-views', label: 'Saved views',
		defaultViews: [
			{ name: 'CWV poor',       mode: 'technical', selections: { 'tech.cwv': ['lcp-poor', 'inp-poor', 'cls-poor'] } },
			{ name: 'Broken pages',   mode: 'technical', selections: { 'page.statusClass': ['4xx', '5xx', 'timeout'] } },
			{ name: 'CSR-blocked',    mode: 'technical', selections: { 'tech.rendering': ['csr-blocked'] } },
		],
	},
];""",
    "content": """export const contentLsSections: ReadonlyArray<SidebarSection> = [
	{ id: 'kpi.stale', kind: 'kpi', label: 'Stale pages (>18mo)',
		compute: ({ pages }) => {
			const n = pages.filter((p: any) => /* stale */ true).length;  // use contentAgeBucket === 'stale'
			return { value: n };
		},
	},
	{ id: 'clusters', kind: 'facet', label: 'Topic clusters', countKey: 'content.cluster', bullet: 'arrow', maxVisible: 10 },
	{ id: 'type', kind: 'facet', label: 'Content type', countKey: 'content.type', bullet: 'arrow',
		buckets: [
			{ value: 'article',     label: 'Article' },
			{ value: 'blog_post',   label: 'Blog post' },
			{ value: 'guide',       label: 'Guide' },
			{ value: 'docs',        label: 'Docs' },
			{ value: 'landing',     label: 'Landing' },
			{ value: 'product',     label: 'Product' },
			{ value: 'category',    label: 'Category' },
			{ value: 'page',        label: 'Page' },
		],
	},
	{ id: 'authors', kind: 'facet', label: 'Authors', countKey: 'content.author', bullet: 'dot-outline', maxVisible: 8 },
	{ id: 'freshness', kind: 'facet', label: 'Freshness', countKey: 'content.freshness', bullet: 'dot',
		buckets: [
			{ value: 'fresh',  label: 'Fresh (≤6mo)',  tone: 'good' },
			{ value: 'aging',  label: 'Aging (6–18mo)' },
			{ value: 'stale',  label: 'Stale (>18mo)', tone: 'warn' },
			{ value: 'nodate', label: 'No date',       dim: () => true },
		],
	},
	{ id: 'quality', kind: 'facet', label: 'Quality buckets', countKey: 'content.quality', bullet: 'dot',
		buckets: [
			{ value: 'high',     label: 'High',      tone: 'good' },
			{ value: 'standard', label: 'Standard' },
			{ value: 'thin',     label: 'Thin (<300w)', tone: 'warn' },
			{ value: 'duplicate', label: 'Duplicate',  tone: 'bad'  },
		],
	},
	{ id: 'duplication', kind: 'facet', label: 'Duplication', countKey: 'content.duplication', bullet: 'diamond',
		buckets: [
			{ value: 'unique',   label: 'Unique',   tone: 'good' },
			{ value: 'cluster:*', label: 'In cluster', dim: () => false },  // dynamic prefix; counts merged in extractor
		],
		hideWhenEmpty: false,
	},
	{ id: 'language', kind: 'facet', label: 'Language', countKey: 'page.lang', bullet: 'arrow' },
	{ id: 'savedViews', kind: 'saved-views', label: 'Saved views',
		defaultViews: [
			{ name: 'Stale articles',  mode: 'content', selections: { 'content.type': ['article', 'blog_post'], 'content.freshness': ['stale'] } },
			{ name: 'Thin product copy', mode: 'content', selections: { 'content.type': ['product'], 'content.quality': ['thin'] } },
			{ name: 'Duplicate clusters', mode: 'content', selections: { 'content.quality': ['duplicate'] } },
		],
	},
];""",
    "links-authority": """export const linksAuthorityLsSections: ReadonlyArray<SidebarSection> = [
	{ id: 'kpi.refDomains', kind: 'kpi', label: 'Referring domains',
		compute: ({ pages }) => {
			const doms = new Set<string>();
			for (const p of pages) for (const b of (p as any).backlinks || []) if (b.sourceDomain) doms.add(b.sourceDomain);
			return { value: doms.size };
		},
	},
	{ id: 'sources', kind: 'facet', label: 'Source domains', countKey: 'links.source', maxVisible: 10 },
	{ id: 'linkType', kind: 'facet', label: 'Link type', countKey: 'links.type',
		buckets: [
			{ value: 'internal',  label: 'Internal' },
			{ value: 'external',  label: 'External' },
			{ value: 'inbound',   label: 'Inbound (backlinks)' },
		],
	},
	{ id: 'attributes', kind: 'facet', label: 'Anchor attributes', countKey: 'links.attribute',
		buckets: [
			{ value: 'dofollow',  label: 'Dofollow',  tone: 'good' },
			{ value: 'nofollow',  label: 'Nofollow' },
			{ value: 'sponsored', label: 'Sponsored' },
			{ value: 'ugc',       label: 'UGC' },
		],
	},
	{ id: 'toxicity', kind: 'facet', label: 'Toxicity', countKey: 'links.toxicity',
		buckets: [
			{ value: 'clean',      label: 'Clean',      tone: 'good' },
			{ value: 'suspicious', label: 'Suspicious', tone: 'warn' },
			{ value: 'toxic',      label: 'Toxic',      tone: 'bad'  },
		],
	},
	{ id: 'depth', kind: 'facet', label: 'Link depth', countKey: 'page.depth',
		buckets: [
			{ value: '0-2', label: 'Depth 0–2', tone: 'good' },
			{ value: '3-4', label: 'Depth 3–4' },
			{ value: '5-6', label: 'Depth 5–6', tone: 'warn' },
			{ value: '7+',  label: 'Depth 7+',   tone: 'bad'  },
		],
	},
	{ id: 'savedViews', kind: 'saved-views', label: 'Saved views',
		defaultViews: [
			{ name: 'Orphan pages',         mode: 'linksAuthority', selections: { 'page.depth': ['7+'] } },
			{ name: 'Toxic backlinks',      mode: 'linksAuthority', selections: { 'links.toxicity': ['toxic'] } },
			{ name: 'Sponsored not flagged', mode: 'linksAuthority', selections: { 'links.attribute': ['sponsored'] } },
		],
	},
];""",
    "ux-conversion": """export const uxConversionLsSections: ReadonlyArray<SidebarSection> = [
	{ id: 'kpi.friction', kind: 'kpi', label: 'Pages with friction',
		compute: ({ pages }) => ({ value: pages.filter((p: any) => (p.frictionSignals || []).length > 0).length }),
	},
	{ id: 'analytics', kind: 'list', label: 'Analytics sources', selectionMode: 'multi', selectionKey: 'ux.source',
		items: [
			{ id: 'ga4',     label: 'GA4',         icon: 'BarChart3' },
			{ id: 'amplitude', label: 'Amplitude', icon: 'Activity' },
			{ id: 'mixpanel', label: 'Mixpanel',   icon: 'Activity' },
			{ id: 'plausible', label: 'Plausible',  icon: 'BarChart3' },
		],
	},
	{ id: 'behavior', kind: 'list', label: 'Behavior sources', selectionMode: 'multi', selectionKey: 'ux.behavior',
		items: [
			{ id: 'hotjar',     label: 'Hotjar',       icon: 'Eye' },
			{ id: 'clarity',    label: 'MS Clarity',   icon: 'Eye' },
			{ id: 'fullstory',  label: 'FullStory',    icon: 'Eye' },
		],
	},
	{ id: 'experiments', kind: 'list', label: 'Experiment platform', selectionMode: 'multi', selectionKey: 'ux.experimentPlatform',
		items: [
			{ id: 'optimizely', label: 'Optimizely', icon: 'Beaker' },
			{ id: 'vwo',        label: 'VWO',         icon: 'Beaker' },
			{ id: 'launchdarkly', label: 'LaunchDarkly', icon: 'Flag' },
		],
	},
	{ id: 'pageRole', kind: 'facet', label: 'Page role', countKey: 'page.template',
		buckets: [
			{ value: 'home',      label: 'Home' },
			{ value: 'landing',   label: 'Landing' },
			{ value: 'product',   label: 'Product' },
			{ value: 'category',  label: 'Category' },
			{ value: 'cart',      label: 'Cart' },
			{ value: 'checkout',  label: 'Checkout' },
			{ value: 'thankYou',  label: 'Thank you' },
		],
	},
	{ id: 'intent', kind: 'facet', label: 'Intent buckets', countKey: 'ux.intent',
		buckets: [
			{ value: 'informational',   label: 'Informational' },
			{ value: 'navigational',    label: 'Navigational' },
			{ value: 'commercial',      label: 'Commercial' },
			{ value: 'transactional',   label: 'Transactional', tone: 'good' },
		],
	},
	{ id: 'device', kind: 'facet', label: 'Device', countKey: 'ux.device',
		buckets: [
			{ value: 'desktop', label: 'Desktop' },
			{ value: 'mobile',  label: 'Mobile' },
			{ value: 'tablet',  label: 'Tablet' },
		],
	},
	{ id: 'friction', kind: 'facet', label: 'Friction signals', countKey: 'ux.frictionSignal',
		buckets: [
			{ value: 'rageClick',     label: 'Rage clicks',     tone: 'bad'  },
			{ value: 'deadClick',     label: 'Dead clicks',     tone: 'warn' },
			{ value: 'errorState',    label: 'Error states',    tone: 'bad'  },
			{ value: 'formAbandon',   label: 'Form abandon',    tone: 'warn' },
			{ value: 'scrollBounce',  label: 'Scroll bounce',   tone: 'warn' },
		],
	},
	{ id: 'cwvOnConverters', kind: 'facet', label: 'CWV on converters', countKey: 'tech.cwv',
		buckets: [
			{ value: 'good',              label: 'Good',              tone: 'good' },
			{ value: 'needs-improvement', label: 'Needs improvement', tone: 'warn' },
			{ value: 'poor',              label: 'Poor',              tone: 'bad'  },
		],
		defaultOpen: false,
	},
	{ id: 'experimentStatus', kind: 'facet', label: 'Experiments', countKey: 'ux.experimentStatus',
		buckets: [
			{ value: 'running',   label: 'Running' },
			{ value: 'paused',    label: 'Paused', dim: () => true },
			{ value: 'concluded', label: 'Concluded' },
		],
		defaultOpen: false,
	},
	{ id: 'savedViews', kind: 'saved-views', label: 'Saved views',
		defaultViews: [
			{ name: 'Rage clicks',           mode: 'uxConversion', selections: { 'ux.frictionSignal': ['rageClick'] } },
			{ name: 'Slow checkout',         mode: 'uxConversion', selections: { 'page.template': ['checkout'], 'tech.cwv': ['poor'] } },
			{ name: 'High-intent friction',  mode: 'uxConversion', selections: { 'ux.intent': ['transactional'], 'ux.frictionSignal': ['rageClick', 'deadClick', 'errorState'] } },
		],
	},
];""",
    "paid": """export const paidLsSections: ReadonlyArray<SidebarSection> = [
	{ id: 'kpi.spend', kind: 'kpi', label: 'Spend pacing (7d)',
		compute: ({ pages }) => ({ value: '—' }),  // computed from connected ad-account data
	},
	{ id: 'networks', kind: 'facet', label: 'Networks', countKey: 'paid.network',
		buckets: [
			{ value: 'google',   label: 'Google Ads' },
			{ value: 'meta',     label: 'Meta' },
			{ value: 'tiktok',   label: 'TikTok' },
			{ value: 'linkedin', label: 'LinkedIn' },
			{ value: 'reddit',   label: 'Reddit' },
			{ value: 'bing',     label: 'Bing' },
		],
	},
	{ id: 'campaignType', kind: 'facet', label: 'Campaign type', countKey: 'paid.campaignType',
		buckets: [
			{ value: 'search',    label: 'Search' },
			{ value: 'pmax',      label: 'Performance Max' },
			{ value: 'shopping',  label: 'Shopping' },
			{ value: 'display',   label: 'Display' },
			{ value: 'video',     label: 'Video' },
			{ value: 'demandGen', label: 'Demand Gen' },
		],
	},
	{ id: 'status', kind: 'list', label: 'Status', selectionMode: 'multi', selectionKey: 'paid.status',
		items: [
			{ id: 'enabled', label: 'Enabled',  tone: 'good' },
			{ id: 'paused',  label: 'Paused',   tone: 'warn' },
			{ id: 'limited', label: 'Limited',  tone: 'warn' },
			{ id: 'removed', label: 'Removed',  tone: 'bad'  },
		],
	},
	{ id: 'funnel', kind: 'facet', label: 'Funnel stage', countKey: 'wqa.funnelStage',
		buckets: [
			{ value: 'awareness',     label: 'Awareness' },
			{ value: 'consideration', label: 'Consideration' },
			{ value: 'conversion',    label: 'Conversion', tone: 'good' },
			{ value: 'retention',     label: 'Retention' },
		],
	},
	{ id: 'qs', kind: 'facet', label: 'Quality score', countKey: 'paid.qualityScore',
		buckets: [
			{ value: 'high',  label: '8–10 High',  tone: 'good' },
			{ value: 'mid',   label: '5–7 Mid' },
			{ value: 'low',   label: '1–4 Low',    tone: 'bad'  },
		],
	},
	{ id: 'creative', kind: 'facet', label: 'Creative health', countKey: 'paid.creativeHealth',
		buckets: [
			{ value: 'fresh',     label: 'Fresh',      tone: 'good' },
			{ value: 'fatigued',  label: 'Fatigued',   tone: 'warn' },
			{ value: 'rejected',  label: 'Rejected',   tone: 'bad'  },
			{ value: 'underReview', label: 'Under review' },
		],
	},
	{ id: 'savedViews', kind: 'saved-views', label: 'Saved views',
		defaultViews: [
			{ name: 'Low-QS active',     mode: 'paid', selections: { 'paid.qualityScore': ['low'], 'paid.status': ['enabled'] } },
			{ name: 'Fatigued creatives', mode: 'paid', selections: { 'paid.creativeHealth': ['fatigued'] } },
			{ name: 'PMax disasters',    mode: 'paid', selections: { 'paid.campaignType': ['pmax'], 'paid.qualityScore': ['low'] } },
		],
	},
];""",
    "commerce": """export const commerceLsSections: ReadonlyArray<SidebarSection> = [
	{ id: 'kpi.outOfStock', kind: 'kpi', label: 'Out-of-stock indexable',
		compute: ({ pages }) => {
			const n = pages.filter((p: any) => p.availability === 'out_of_stock' && p.indexable !== false).length;
			return { value: n, tone: n > 0 ? 'bad' : 'good' };
		},
	},
	{ id: 'availability', kind: 'facet', label: 'Stock availability', countKey: 'commerce.availability',
		buckets: [
			{ value: 'in_stock',     label: 'In stock',     tone: 'good' },
			{ value: 'out_of_stock', label: 'Out of stock', tone: 'bad'  },
			{ value: 'backorder',    label: 'Backorder',    tone: 'warn' },
			{ value: 'preorder',     label: 'Preorder' },
		],
	},
	{ id: 'template', kind: 'facet', label: 'Page templates', countKey: 'commerce.template',
		buckets: [
			{ value: 'PDP',      label: 'Product detail (PDP)' },
			{ value: 'PLP',      label: 'Listing (PLP)' },
			{ value: 'cart',     label: 'Cart' },
			{ value: 'checkout', label: 'Checkout' },
			{ value: 'other',    label: 'Other' },
		],
	},
	{ id: 'priceBand', kind: 'facet', label: 'Price band', countKey: 'commerce.priceBand',
		buckets: [
			{ value: 'lt50',    label: 'Under $50' },
			{ value: '50-200',  label: '$50–$200' },
			{ value: 'gt200',   label: '$200+' },
		],
	},
	{ id: 'collections', kind: 'list', label: 'Collections', selectionMode: 'multi', selectionKey: 'commerce.collection',
		items: [],  // resolved at runtime from p.collections
		resolveItems: ({ pages }) => {
			const counts: Record<string, number> = {};
			for (const p of pages) for (const c of (p as any).collections || []) counts[c] = (counts[c] || 0) + 1;
			return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([id, n]) => ({ id, label: id, meta: String(n) }));
		},
	},
	{ id: 'savedViews', kind: 'saved-views', label: 'Saved views',
		defaultViews: [
			{ name: 'Sold-out indexed', mode: 'commerce', selections: { 'commerce.availability': ['out_of_stock'], 'page.indexability': ['indexed'] } },
			{ name: 'PDP missing schema', mode: 'commerce', selections: { 'commerce.template': ['PDP'], 'page.template': [] } },
			{ name: 'High-value items',   mode: 'commerce', selections: { 'commerce.priceBand': ['gt200'] } },
		],
	},
];""",
    "social-brand": """export const socialBrandLsSections: ReadonlyArray<SidebarSection> = [
	{ id: 'kpi.mentions7d', kind: 'kpi', label: 'Mentions (7d)',
		compute: ({ pages }) => ({ value: pages.filter((p: any) => p.mentionsLast7d).length }),
	},
	{ id: 'profiles', kind: 'list', label: 'Profiles', selectionMode: 'multi', selectionKey: 'social.profile',
		items: [
			{ id: 'instagram', label: 'Instagram', icon: 'Instagram' },
			{ id: 'tiktok',    label: 'TikTok',     icon: 'Music' },
			{ id: 'x',         label: 'X / Twitter', icon: 'Twitter' },
			{ id: 'youtube',   label: 'YouTube',    icon: 'Youtube' },
			{ id: 'linkedin',  label: 'LinkedIn',   icon: 'Linkedin' },
			{ id: 'facebook',  label: 'Facebook',   icon: 'Facebook' },
			{ id: 'pinterest', label: 'Pinterest',  icon: 'Bookmark' },
			{ id: 'reddit',    label: 'Reddit',     icon: 'MessageCircle' },
			{ id: 'discord',   label: 'Discord',    icon: 'MessageSquare' },
		],
	},
	{ id: 'contentType', kind: 'facet', label: 'Content type', countKey: 'social.contentType',
		buckets: [
			{ value: 'reel',      label: 'Reel / Short' },
			{ value: 'image',     label: 'Image' },
			{ value: 'carousel',  label: 'Carousel' },
			{ value: 'video',     label: 'Video' },
			{ value: 'story',     label: 'Story' },
			{ value: 'live',      label: 'Live' },
			{ value: 'text',      label: 'Text' },
		],
	},
	{ id: 'postStatus', kind: 'facet', label: 'Post status', countKey: 'social.postStatus',
		buckets: [
			{ value: 'published', label: 'Published',  tone: 'good' },
			{ value: 'scheduled', label: 'Scheduled' },
			{ value: 'draft',     label: 'Draft',      dim: () => true },
			{ value: 'failed',    label: 'Failed',     tone: 'bad'  },
		],
	},
	{ id: 'campaign', kind: 'list', label: 'Campaigns / Calendar', selectionMode: 'multi', selectionKey: 'social.campaign',
		items: [],
		resolveItems: ({ pages }) => {
			const counts: Record<string, number> = {};
			for (const p of pages) if ((p as any).campaignId) counts[(p as any).campaignId] = (counts[(p as any).campaignId] || 0) + 1;
			return Object.entries(counts).slice(0, 10).map(([id, n]) => ({ id, label: id, meta: String(n) }));
		},
	},
	{ id: 'mentionsFilter', kind: 'list', label: 'Mentions filter', selectionMode: 'multi', selectionKey: 'social.mentionsFilter',
		items: [
			{ id: 'positive',  label: 'Positive',  tone: 'good' },
			{ id: 'negative',  label: 'Negative',  tone: 'bad'  },
			{ id: 'unanswered', label: 'Unanswered', tone: 'warn' },
			{ id: 'verified',  label: 'Verified accounts', icon: 'BadgeCheck' },
		],
	},
	{ id: 'influencer', kind: 'facet', label: 'Influencer tier', countKey: 'social.influencerTier',
		buckets: [
			{ value: 'nano',  label: 'Nano (<10k)' },
			{ value: 'micro', label: 'Micro (10–100k)' },
			{ value: 'mid',   label: 'Mid (100k–1M)' },
			{ value: 'macro', label: 'Macro (>1M)' },
		],
	},
	{ id: 'hashtags', kind: 'list', label: 'Hashtags / Topics', selectionMode: 'multi', selectionKey: 'social.hashtag',
		items: [],
		resolveItems: ({ pages }) => {
			const counts: Record<string, number> = {};
			for (const p of pages) for (const h of (p as any).hashtags || []) counts[h] = (counts[h] || 0) + 1;
			return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([id, n]) => ({ id, label: `#${id}`, meta: String(n) }));
		},
	},
	{ id: 'utm', kind: 'list', label: 'UTM / Traffic sources', selectionMode: 'multi', selectionKey: 'social.utmSource',
		items: [],
		resolveItems: ({ pages }) => {
			const counts: Record<string, number> = {};
			for (const p of pages) if ((p as any).utmSource) counts[(p as any).utmSource] = (counts[(p as any).utmSource] || 0) + 1;
			return Object.entries(counts).slice(0, 8).map(([id, n]) => ({ id, label: id, meta: String(n) }));
		},
	},
	{ id: 'savedViews', kind: 'saved-views', label: 'Saved views',
		defaultViews: [
			{ name: 'Negative unanswered', mode: 'socialBrand', selections: { 'social.mentionsFilter': ['negative', 'unanswered'] } },
			{ name: 'Top reels',           mode: 'socialBrand', selections: { 'social.contentType': ['reel'] } },
			{ name: 'Macro influencers',   mode: 'socialBrand', selections: { 'social.influencerTier': ['macro'] } },
		],
	},
];""",
    "ai": """export const aiLsSections: ReadonlyArray<SidebarSection> = [
	{ id: 'kpi.citations', kind: 'kpi', label: 'AI citations',
		compute: ({ pages }) => ({ value: pages.reduce((n: number, p: any) => n + ((p.aiCitations || []).length), 0) }),
	},
	{ id: 'engines', kind: 'facet', label: 'Engines', countKey: 'ai.engine',
		buckets: [
			{ value: 'chatgpt',     label: 'ChatGPT' },
			{ value: 'perplexity',  label: 'Perplexity' },
			{ value: 'gemini',      label: 'Gemini' },
			{ value: 'claude',      label: 'Claude' },
			{ value: 'copilot',     label: 'Copilot' },
			{ value: 'aiOverviews', label: 'Google AI Overviews' },
			{ value: 'youCom',      label: 'You.com' },
		],
	},
	{ id: 'citationStatus', kind: 'facet', label: 'Citation status', countKey: 'ai.citationStatus',
		buckets: [
			{ value: 'cited',    label: 'Cited',    tone: 'good' },
			{ value: 'losing',   label: 'Losing citations', tone: 'bad' },
			{ value: 'uncited',  label: 'Uncited',  dim: () => true },
		],
	},
	{ id: 'snippetType', kind: 'facet', label: 'Snippet type', countKey: 'ai.snippetType',
		buckets: [
			{ value: 'summary',     label: 'Summary' },
			{ value: 'list',        label: 'List' },
			{ value: 'comparison',  label: 'Comparison' },
			{ value: 'definition',  label: 'Definition' },
			{ value: 'howto',       label: 'How-to' },
			{ value: 'quote',       label: 'Direct quote' },
		],
	},
	{ id: 'topicCluster', kind: 'facet', label: 'Topic clusters', countKey: 'content.cluster', maxVisible: 10 },
	{ id: 'queryIntent', kind: 'facet', label: 'Query intent', countKey: 'ux.intent',
		buckets: [
			{ value: 'informational',   label: 'Informational' },
			{ value: 'navigational',    label: 'Navigational' },
			{ value: 'commercial',      label: 'Commercial' },
			{ value: 'transactional',   label: 'Transactional' },
		],
	},
	{ id: 'savedViews', kind: 'saved-views', label: 'Saved views',
		defaultViews: [
			{ name: 'Losing citations',   mode: 'ai', selections: { 'ai.citationStatus': ['losing'] } },
			{ name: 'AI Overviews wins',  mode: 'ai', selections: { 'ai.engine': ['aiOverviews'], 'ai.citationStatus': ['cited'] } },
			{ name: 'Uncited high-intent', mode: 'ai', selections: { 'ai.citationStatus': ['uncited'], 'ux.intent': ['transactional', 'commercial'] } },
		],
	},
];""",
    "competitors": """export const competitorsLsSections: ReadonlyArray<SidebarSection> = [
	{ id: 'kpi.tracked', kind: 'kpi', label: 'Tracked competitors',
		compute: ({ pages }) => {
			const set = new Set<string>();
			for (const p of pages) if ((p as any).competitorId) set.add((p as any).competitorId);
			return { value: set.size };
		},
	},
	{ id: 'competitors', kind: 'list', label: 'Competitors', selectionMode: 'multi', selectionKey: 'comp.competitor', defaultOpen: true, bullet: 'diamond',
		items: [],
		resolveItems: ({ pages }) => {
			const counts: Record<string, number> = {};
			for (const p of pages) if ((p as any).competitorId) counts[(p as any).competitorId] = (counts[(p as any).competitorId] || 0) + 1;
			const rows = Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([id, n]) => {
				const dr = 60 + (id.length % 35); // mock DR
				return { id, label: id, meta: `DR ${dr} ${n > 0 ? '●' : ''}` };
			});
			return [
				...rows,
				{ id: 'add',  label: 'Add competitor', meta: `${rows.length}/10`, icon: 'Plus', action: 'add' },
				{ id: 'auto', label: 'Auto-discover', icon: 'Plus', action: 'discover' },
			];
		},
	},
	{ id: 'clusters', kind: 'list', label: 'Topic clusters', bullet: 'arrow',
		items: [],
		resolveItems: ({ pages }) => {
			const counts: Record<string, number> = {};
			for (const p of pages) if ((p as any).cluster) counts[(p as any).cluster] = (counts[(p as any).cluster] || 0) + 1;
			const rows = Object.entries(counts).slice(0, 5).map(([id, n]) => ({ id, label: id, meta: `${n} kw` }));
			return [...rows, { id: 'new', label: 'New cluster', icon: 'Plus', action: 'new' }];
		},
	},
	{ id: 'gapType', kind: 'facet', label: 'Gap type', countKey: 'comp.gapType', bullet: 'dot',
		buckets: [
			{ value: 'catchable',    label: 'Catchable',    tone: 'warn' },
			{ value: 'aspirational', label: 'Aspirational', tone: 'info' },
			{ value: 'defensive',    label: 'Defensive',    tone: 'good' },
			{ value: 'unshared',     label: 'Unshared / ours' },
		],
	},
	{ id: 'serpFeatures', kind: 'facet', label: 'SERP features', countKey: 'comp.serpFeature', bullet: 'diamond',
		buckets: [
			{ value: 'ai-overview',      label: 'AI overview' },
			{ value: 'paa',              label: 'PAA' },
			{ value: 'featured-snippet', label: 'Featured snippet' },
			{ value: 'shopping',         label: 'Shopping' },
			{ value: 'local-pack',       label: 'Local pack' },
			{ value: 'video',            label: 'Video' },
		],
	},
	{ id: 'winLoss', kind: 'facet', label: 'Win / Loss (30d)', countKey: 'comp.winLoss', bullet: 'win-loss',
		buckets: [
			{ value: 'win',    label: 'Wins',   tone: 'good' },
			{ value: 'loss',   label: 'Losses', tone: 'bad'  },
			{ value: 'stable', label: 'Stable' },
		],
	},
	{ id: 'linkOverlap', kind: 'facet', label: 'Link overlap', countKey: 'comp.linkOverlap', bullet: 'diamond',
		buckets: [
			{ value: 'shared',       label: 'Shared refs' },
			{ value: 'their-unique', label: 'Their unique' },
			{ value: 'our-unique',   label: 'Our unique' },
		],
	},
	{ id: 'savedViews', kind: 'saved-views', label: 'Saved views',
		defaultViews: [
			{ name: 'Catchable gaps',   mode: 'competitors', selections: { 'comp.gapType': ['catchable'] } },
			{ name: 'AI overview wins', mode: 'competitors', selections: { 'comp.serpFeature': ['ai-overview'], 'comp.winLoss': ['win'] } },
			{ name: 'Unique links',     mode: 'competitors', selections: { 'comp.linkOverlap': ['our-unique'] } },
		],
	},
];""",
    "local": """export const localLsSections: ReadonlyArray<SidebarSection> = [
	{ id: 'kpi.locations', kind: 'kpi', label: 'Locations',
		compute: ({ pages }) => {
			const set = new Set<string>();
			for (const p of pages) if ((p as any).locationId) set.add((p as any).locationId);
			return { value: set.size };
		},
	},
	{ id: 'locations', kind: 'list', label: 'Locations tree', selectionMode: 'multi', selectionKey: 'local.location', defaultOpen: true, bullet: 'diamond',
		items: [],
		resolveItems: ({ pages }) => {
			// mock tree: USA -> NY -> Manhattan/Brooklyn
			return [
				{ id: 'usa', label: 'USA', meta: '8', children: [
					{ id: 'ny', label: 'NY', meta: '2', children: [
						{ id: 'manhattan', label: 'Manhattan', meta: '✓ ●' },
						{ id: 'brooklyn',  label: 'Brooklyn',  meta: '✓' },
					]},
					{ id: 'ca', label: 'CA', meta: '3', children: [] },
					{ id: 'tx', label: 'TX', meta: '3', children: [] },
				]},
				{ id: 'uk', label: 'UK', meta: '2', children: [] },
				{ id: 'add', label: 'Add location', icon: 'Plus', action: 'add' },
			];
		},
	},
	{ id: 'serviceAreas', kind: 'list', label: 'Service areas', bullet: 'arrow',
		items: [
			{ id: 'nyc',    label: 'NYC metro' },
			{ id: 'bay',    label: 'Bay Area' },
			{ id: 'london', label: 'London core' },
		],
	},
	{ id: 'gbpStatus', kind: 'facet', label: 'GBP status', countKey: 'local.gbpStatus', bullet: 'dot',
		buckets: [
			{ value: 'verified',  label: 'Verified',  tone: 'good' },
			{ value: 'pending',   label: 'Pending',   tone: 'warn' },
			{ value: 'suspended', label: 'Suspended', tone: 'bad'  },
			{ value: 'unclaimed', label: 'No GBP claim' },
		],
	},
	{ id: 'category', kind: 'facet', label: 'Primary category', countKey: 'local.category', bullet: 'arrow',
		buckets: [
			{ value: 'cafe',       label: 'Cafe' },
			{ value: 'restaurant', label: 'Restaurant' },
			{ value: 'retail',     label: 'Retail' },
			{ value: 'office',     label: 'Office' },
		],
	},
	{ id: 'reviewSources', kind: 'list', label: 'Review sources', selectionMode: 'multi', selectionKey: 'local.source', bullet: 'check',
		items: [
			{ id: 'google',      label: 'Google',      meta: '●', tone: 'good' },
			{ id: 'yelp',        label: 'Yelp',        meta: '●', tone: 'good' },
			{ id: 'trustpilot',  label: 'Trustpilot',  meta: '●', tone: 'good' },
			{ id: 'facebook',    label: 'Facebook' },
			{ id: 'tripadvisor', label: 'TripAdvisor' },
			{ id: 'opentable',   label: 'OpenTable' },
			{ id: 'connect',     label: 'Connect source', icon: 'Plus', action: 'connect' },
		],
	},
	{ id: 'reviewBuckets', kind: 'facet', label: 'Review buckets', countKey: 'local.reviewBucket', bullet: 'bucket',
		buckets: [
			{ value: '4.5+',   label: '4.5+',   bullet: '★' },
			{ value: '4.0',    label: '4.0-4.4', bullet: '★' },
			{ value: '3.5',    label: '3.5-3.9', bullet: '★' },
			{ value: '<3.5',   label: '<3.5',   bullet: '★' },
			{ value: 'unans',  label: 'Unanswered (<48h)', bullet: '◆' },
		],
	},
	{ id: 'napStatus', kind: 'facet', label: 'NAP / Citations', countKey: 'local.napStatus', bullet: 'bucket',
		buckets: [
			{ value: 'match',    label: 'Consistent',       bullet: '✓', tone: 'good' },
			{ value: 'mismatch', label: 'Mismatched',       bullet: '⚠', tone: 'warn' },
			{ value: 'missing',  label: 'Missing from dir', bullet: '✗', tone: 'bad'  },
		],
	},
	{ id: 'localPack', kind: 'facet', label: 'Local pack', countKey: 'local.pack', bullet: 'dot',
		buckets: [
			{ value: 'top3',     label: 'Top-3', tone: 'good' },
			{ value: '4-10',     label: '4-10' },
			{ value: 'none',     label: 'Not ranking' },
		],
	},
	{ id: 'savedViews', kind: 'saved-views', label: 'Saved views',
		defaultViews: [
			{ name: 'Unverified GBPs',   mode: 'local', selections: { 'local.gbpStatus': ['pending', 'suspended', 'unclaimed'] } },
			{ name: 'Low ratings',       mode: 'local', selections: { 'local.reviewBucket': ['3.5', '<3.5'] } },
			{ name: 'NAP inconsistencies', mode: 'local', selections: { 'local.napStatus': ['mismatch', 'missing'] } },
		],
	},
];"""
}

# Iterate over modes and patch
for mode, new_content in modes.items():
    file_path = os.path.join(base_dir, f"{mode}.ts")
    if not os.path.exists(file_path):
        print(f"File {file_path} not found.")
        continue
        
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
        
    var_name = new_content.split('export const ')[1].split(':')[0].strip()
    
    if "import type { SidebarSection }" not in content:
        content = "import type { SidebarSection } from '../sidebar-types';\n" + content
        
    # Prepend new_content below the imports (right before `export function`)
    if var_name not in content:
        content = content.replace("export function ", new_content + "\n\nexport function ")
    
    # regex replace `lsSections: [ ... ]` until `rsTabs:`
    # we can use lookahead for `rsTabs:`
    content = re.sub(r"lsSections:\s*\[[\s\S]*?\],(?=\s*rsTabs:)", f"lsSections: {var_name},", content)
    
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
        
    print(f"Patched {mode}.ts")
