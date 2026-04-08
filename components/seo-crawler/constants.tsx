import React from 'react';
import { Database, Globe, Server, Compass, Code, Box, LinkIcon, FastForward, MapIcon, Search } from 'lucide-react';

export const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const ALL_COLUMNS = [
    // General
    { key: 'url', label: 'Address', width: '350px', group: 'General' },
    { key: 'contentType', label: 'Content Type', width: '120px', group: 'General' },
    { key: 'statusCode', label: 'Status Code', width: '90px', group: 'General' },
    { key: 'status', label: 'Status', width: '100px', group: 'General' },
    { key: 'indexable', label: 'Indexability', width: '100px', group: 'General' },
    { key: 'indexabilityStatus', label: 'Indexability Status', width: '140px', group: 'General' },
    { key: 'title', label: 'Title 1', width: '300px', group: 'General' },
    { key: 'titleLength', label: 'Title 1 Length', width: '100px', group: 'General' },
    { key: 'titlePixelWidth', label: 'Title 1 Pixel Width', width: '130px', group: 'General' },
    { key: 'metaDesc', label: 'Meta Description 1', width: '350px', group: 'General' },
    { key: 'metaDescLength', label: 'Meta Description 1 Length', width: '160px', group: 'General' },
    { key: 'metaDescPixelWidth', label: 'Meta Description 1 Pixel Width', width: '180px', group: 'General' },
    { key: 'metaKeywords', label: 'Meta Keywords 1', width: '200px', group: 'General' },
    { key: 'metaKeywordsLength', label: 'Meta Keywords 1 Length', width: '160px', group: 'General' },
    { key: 'h1_1', label: 'H1-1', width: '250px', group: 'General' },
    { key: 'h1_1Length', label: 'H1-1 Length', width: '100px', group: 'General' },
    { key: 'h1_2', label: 'H1-2', width: '250px', group: 'General' },
    { key: 'h1_2Length', label: 'H1-2 Length', width: '100px', group: 'General' },
    { key: 'h2_1', label: 'H2-1', width: '250px', group: 'General' },
    { key: 'h2_1Length', label: 'H2-1 Length', width: '100px', group: 'General' },
    { key: 'h2_2', label: 'H2-2', width: '250px', group: 'General' },
    { key: 'h2_2Length', label: 'H2-2 Length', width: '100px', group: 'General' },
    
    // Technical
    { key: 'metaRobots1', label: 'Meta Robots 1', width: '120px', group: 'Technical' },
    { key: 'metaRobots2', label: 'Meta Robots 2', width: '120px', group: 'Technical' },
    { key: 'xRobots', label: 'X-Robots-Tag 1', width: '120px', group: 'Technical' },
    { key: 'metaRefresh', label: 'Meta Refresh 1', width: '120px', group: 'Technical' },
    { key: 'canonical', label: 'Canonical Link Element 1', width: '350px', group: 'Technical' },
    { key: 'relNextTag', label: 'rel="next" 1', width: '150px', group: 'Technical' },
    { key: 'relPrevTag', label: 'rel="prev" 1', width: '150px', group: 'Technical' },
    { key: 'httpRelNext', label: 'HTTP rel="next" 1', width: '150px', group: 'Technical' },
    { key: 'httpRelPrev', label: 'HTTP rel="prev" 1', width: '150px', group: 'Technical' },
    { key: 'amphtml', label: 'amphtml Link Element', width: '200px', group: 'Technical' },
    { key: 'httpVersion', label: 'HTTP Version', width: '100px', group: 'Technical' },
    { key: 'mobileAlt', label: 'Mobile Alternate Link', width: '200px', group: 'Technical' },
    { key: 'redirectUrl', label: 'Redirect URL', width: '350px', group: 'Technical' },
    { key: 'finalUrl', label: 'Final URL', width: '350px', group: 'Technical' },
    { key: 'redirectChainLength', label: 'Redirect Hops', width: '120px', group: 'Technical' },
    { key: 'isRedirectLoop', label: 'Redirect Loop', width: '120px', group: 'Technical' },
    { key: 'redirectType', label: 'Redirect Type', width: '120px', group: 'Technical' },
    { key: 'inSitemap', label: 'In Sitemap', width: '110px', group: 'Technical' },
    { key: 'cookies', label: 'Cookies', width: '80px', group: 'Technical' },
    { key: 'language', label: 'Language', width: '80px', group: 'Technical' },
    { key: 'xRobotsNoindex', label: 'X-Robots Noindex', width: '140px', group: 'Technical' },
    { key: 'xRobotsNofollow', label: 'X-Robots Nofollow', width: '140px', group: 'Technical' },
    
    // Metrics
    { key: 'sizeBytes', label: 'Size (bytes)', width: '110px', group: 'Metrics' },
    { key: 'transferredBytes', label: 'Transferred (bytes)', width: '140px', group: 'Metrics' },
    { key: 'totalTransferred', label: 'Total Transferred (bytes)', width: '160px', group: 'Metrics' },
    { key: 'co2Mg', label: 'CO2 (mg)', width: '100px', group: 'Metrics' },
    { key: 'carbonRating', label: 'Carbon Rating', width: '110px', group: 'Metrics' },
    { key: 'lcp', label: 'LCP (ms)', width: '100px', group: 'Metrics' },
    { key: 'cls', label: 'CLS', width: '90px', group: 'Metrics' },
    { key: 'inp', label: 'INP (ms)', width: '100px', group: 'Metrics' },
    { key: 'wordCount', label: 'Word Count', width: '110px', group: 'Metrics' },
    { key: 'sentenceCount', label: 'Sentence Count', width: '120px', group: 'Metrics' },
    { key: 'avgWordsPerSentence', label: 'Average Words Per Sentence', width: '180px', group: 'Metrics' },
    { key: 'fleschScore', label: 'Flesch Reading Ease Score', width: '180px', group: 'Metrics' },
    { key: 'readability', label: 'Readability', width: '120px', group: 'Metrics' },
    { key: 'textRatio', label: 'Text Ratio', width: '100px', group: 'Metrics' },
    { key: 'loadTime', label: 'Response Time', width: '120px', group: 'Metrics' },
    { key: 'dnsResolutionTime', label: 'DNS Time (ms)', width: '110px', group: 'Metrics' },
    { key: 'lastModified', label: 'Last Modified', width: '180px', group: 'Metrics' },
    { key: 'missingAltImages', label: 'Missing Alt Images', width: '140px', group: 'Metrics' },
    { key: 'longAltImages', label: 'Long Alt Images', width: '130px', group: 'Metrics' },
    { key: 'totalImages', label: 'Total Images', width: '110px', group: 'Metrics' },
    { key: 'domNodeCount', label: 'DOM Nodes', width: '110px', group: 'Metrics' },
    { key: 'renderBlockingCss', label: 'Render-Blocking CSS', width: '150px', group: 'Metrics' },
    { key: 'renderBlockingJs', label: 'Render-Blocking JS', width: '150px', group: 'Metrics' },
    { key: 'thirdPartyScriptCount', label: '3rd-Party Scripts', width: '140px', group: 'Metrics' },
    { key: 'preconnectCount', label: 'Preconnect Hints', width: '130px', group: 'Metrics' },
    { key: 'prefetchCount', label: 'DNS Prefetch Hints', width: '140px', group: 'Metrics' },
    { key: 'preloadCount', label: 'Preload Hints', width: '120px', group: 'Metrics' },
    { key: 'legacyFormatImages', label: 'Legacy Image Formats', width: '150px', group: 'Metrics' },
    { key: 'modernFormatImages', label: 'Modern Image Formats', width: '150px', group: 'Metrics' },
    { key: 'imagesWithoutSrcset', label: 'Images Without Srcset', width: '150px', group: 'Metrics' },
    { key: 'imagesWithoutLazy', label: 'Images Without Lazy', width: '150px', group: 'Metrics' },
    { key: 'imagesWithoutDimensions', label: 'Images Without Dimensions', width: '170px', group: 'Metrics' },
    
    // Links
    { key: 'crawlDepth', label: 'Crawl Depth', width: '100px', group: 'Links' },
    { key: 'folderDepth', label: 'Folder Depth', width: '110px', group: 'Links' },
    { key: 'linkScore', label: 'Link Score', width: '100px', group: 'Links' },
    { key: 'inlinks', label: 'Inlinks', width: '90px', group: 'Links' },
    { key: 'uniqueInlinks', label: 'Unique Inlinks', width: '120px', group: 'Links' },
    { key: 'uniqueJsInlinks', label: 'Unique JS Inlinks', width: '130px', group: 'Links' },
    { key: 'percentOfTotal', label: '% of Total', width: '100px', group: 'Links' },
    { key: 'outlinks', label: 'Outlinks', width: '90px', group: 'Links' },
    { key: 'uniqueOutlinks', label: 'Unique Outlinks', width: '120px', group: 'Links' },
    { key: 'uniqueJsOutlinks', label: 'Unique JS Outlinks', width: '130px', group: 'Links' },
    { key: 'externalOutlinks', label: 'External Outlinks', width: '130px', group: 'Links' },
    { key: 'uniqueExternalOutlinks', label: 'Unique External Outlinks', width: '180px', group: 'Links' },
    { key: 'uniqueExternalJsOutlinks', label: 'Unique External JS Outlinks', width: '200px', group: 'Links' },
    
    // Advanced
    { key: 'nearDuplicateMatch', label: 'Closest Near Duplicate Match', width: '300px', group: 'Advanced' },
    { key: 'noNearDuplicates', label: 'No. Near Duplicates', width: '140px', group: 'Advanced' },
    { key: 'spellingErrors', label: 'Spelling Errors', width: '120px', group: 'Advanced' },
    { key: 'grammarErrors', label: 'Grammar Errors', width: '120px', group: 'Advanced' },
    { key: 'hash', label: 'Hash', width: '300px', group: 'Advanced' },
    { key: 'closestSemanticAddress', label: 'Closest Semantically Similar Address', width: '350px', group: 'Advanced' },
    { key: 'semanticSimilarityScore', label: 'Semantic Similarity Score', width: '180px', group: 'Advanced' },
    { key: 'topicCluster', label: 'AI Topic Cluster', width: '200px', group: 'Advanced' },
    { key: 'internalPageRank', label: 'Internal PageRank', width: '150px', group: 'Advanced' },
    { key: 'linkEquity', label: 'Link Equity (0-10)', width: '150px', group: 'Advanced' },
    { key: 'funnelStage', label: 'Funnel Stage (AI)', width: '150px', group: 'Advanced' },
    { key: 'searchIntent', label: 'Search Intent (AI)', width: '160px', group: 'Advanced' },
    { key: 'strategicPriority', label: 'Strategic Priority', width: '160px', group: 'Advanced' },
    { key: 'contentDecay', label: 'Content Decay', width: '150px', group: 'Advanced' },
    { key: 'multipleH1s', label: 'Multiple H1s', width: '120px', group: 'Advanced' },
    { key: 'incorrectHeadingOrder', label: 'Heading Order Issue', width: '150px', group: 'Advanced' },
    { key: 'schemaErrors', label: 'Schema Errors', width: '120px', group: 'Advanced' },
    { key: 'schemaWarnings', label: 'Schema Warnings', width: '130px', group: 'Advanced' },
    { key: 'crawlTimestamp', label: 'Crawl Timestamp', width: '200px', group: 'Advanced' },
    { key: 'visibleDate', label: 'Visible Date', width: '160px', group: 'Advanced' },
    { key: 'anchorTextDiversity', label: 'Anchor Text Diversity', width: '160px', group: 'Advanced' },
    { key: 'isSoft404', label: 'Soft 404', width: '100px', group: 'Advanced' },
    { key: 'hasFavicon', label: 'Favicon', width: '90px', group: 'Advanced' },
    { key: 'hasCharset', label: 'Charset', width: '90px', group: 'Advanced' },
    { key: 'hasRssFeed', label: 'RSS/Atom Feed', width: '120px', group: 'Advanced' },
    { key: 'hasServiceWorker', label: 'Service Worker', width: '120px', group: 'Advanced' },
    { key: 'hasWebManifest', label: 'Web Manifest', width: '120px', group: 'Advanced' },

    // Security
    { key: 'hasHsts', label: 'HSTS', width: '80px', group: 'Security' },
    { key: 'hstsMaxAge', label: 'HSTS Max-Age', width: '120px', group: 'Security' },
    { key: 'hstsPreload', label: 'HSTS Preload', width: '100px', group: 'Security' },
    { key: 'hasCsp', label: 'CSP', width: '80px', group: 'Security' },
    { key: 'cspHasUnsafeInline', label: 'CSP Unsafe-Inline', width: '150px', group: 'Security' },
    { key: 'cspHasUnsafeEval', label: 'CSP Unsafe-Eval', width: '140px', group: 'Security' },
    { key: 'hasXFrameOptions', label: 'X-Frame-Options', width: '130px', group: 'Security' },
    { key: 'hasXContentTypeOptions', label: 'X-Content-Type-Options', width: '170px', group: 'Security' },
    { key: 'hasReferrerPolicy', label: 'Referrer Policy', width: '120px', group: 'Security' },
    { key: 'hasPermissionsPolicy', label: 'Permissions Policy', width: '140px', group: 'Security' },
    { key: 'corsWildcard', label: 'CORS Wildcard', width: '120px', group: 'Security' },
    { key: 'sslValid', label: 'SSL Valid', width: '90px', group: 'Security' },
    { key: 'sslProtocol', label: 'TLS Version', width: '110px', group: 'Security' },
    { key: 'sslDaysUntilExpiry', label: 'SSL Expiry (days)', width: '140px', group: 'Security' },
    { key: 'sslIsWeakProtocol', label: 'Weak TLS', width: '90px', group: 'Security' },
    { key: 'cookieCount', label: 'Cookie Count', width: '110px', group: 'Security' },
    { key: 'insecureCookies', label: 'Insecure Cookies', width: '130px', group: 'Security' },
    { key: 'cookiesMissingSameSite', label: 'Cookies Missing SameSite', width: '170px', group: 'Security' },
    { key: 'scriptsWithoutSri', label: 'Scripts Without SRI', width: '140px', group: 'Security' },
    { key: 'exposedApiKeys', label: 'Exposed API Keys', width: '130px', group: 'Security' },
    { key: 'privacyPageLinked', label: 'Privacy Policy Link', width: '140px', group: 'Security' },
    { key: 'termsPageLinked', label: 'Terms Link', width: '110px', group: 'Security' },
    { key: 'hasCookieBanner', label: 'Cookie Banner', width: '120px', group: 'Security' },

    // Accessibility
    { key: 'hasMainLandmark', label: 'Main Landmark', width: '120px', group: 'Accessibility' },
    { key: 'hasNavLandmark', label: 'Nav Landmark', width: '120px', group: 'Accessibility' },
    { key: 'hasHeaderLandmark', label: 'Header Landmark', width: '130px', group: 'Accessibility' },
    { key: 'hasFooterLandmark', label: 'Footer Landmark', width: '130px', group: 'Accessibility' },
    { key: 'hasSkipLink', label: 'Skip Link', width: '100px', group: 'Accessibility' },
    { key: 'formsWithoutLabels', label: 'Forms Without Labels', width: '150px', group: 'Accessibility' },
    { key: 'viewportNoScale', label: 'Zoom Disabled', width: '110px', group: 'Accessibility' },
    { key: 'genericLinkTextCount', label: 'Generic Links', width: '120px', group: 'Accessibility' },
    { key: 'invalidAriaCount', label: 'Invalid ARIA', width: '110px', group: 'Accessibility' },
    { key: 'tablesWithoutHeaders', label: 'Tables Without Headers', width: '160px', group: 'Accessibility' },

    // Cache
    { key: 'hasCacheControl', label: 'Cache-Control', width: '120px', group: 'Cache' },
    { key: 'cacheMaxAge', label: 'Cache Max-Age', width: '120px', group: 'Cache' },
    { key: 'cacheNoCache', label: 'No-Cache', width: '100px', group: 'Cache' },
    { key: 'cacheNoStore', label: 'No-Store', width: '100px', group: 'Cache' },
    { key: 'hasEtag', label: 'ETag', width: '80px', group: 'Cache' },
    { key: 'hasLastModified', label: 'Last-Modified Header', width: '150px', group: 'Cache' },
    { key: 'hasExpires', label: 'Expires Header', width: '120px', group: 'Cache' },

    // Mobile
    { key: 'hasViewportMeta', label: 'Viewport Meta', width: '120px', group: 'Mobile' },
    { key: 'viewportWidth', label: 'Device Width Viewport', width: '150px', group: 'Mobile' },
    { key: 'smallTapTargets', label: 'Small Tap Targets', width: '130px', group: 'Mobile' },
    { key: 'smallFontCount', label: 'Small Fonts', width: '110px', group: 'Mobile' },

    // URL Structure
    { key: 'urlLength', label: 'URL Length', width: '100px', group: 'URL Structure' },
    { key: 'hasQueryParams', label: 'Has Query Params', width: '130px', group: 'URL Structure' },
    { key: 'hasUppercase', label: 'Uppercase URL', width: '120px', group: 'URL Structure' },
    { key: 'hasTrailingSlash', label: 'Trailing Slash', width: '110px', group: 'URL Structure' },
    { key: 'hasSessionId', label: 'Session ID in URL', width: '140px', group: 'URL Structure' },
    { key: 'hasSpacesEncoded', label: 'Encoded Spaces', width: '120px', group: 'URL Structure' },
    
    // Search Performance (GSC & Keywords)
    { key: 'gscClicks', label: 'Clicks (30d)', width: '130px', group: 'Search Console' },
    { key: 'gscImpressions', label: 'Impressions (30d)', width: '160px', group: 'Search Console' },
    { key: 'gscCtr', label: 'CTR', width: '100px', group: 'Search Console' },
    { key: 'gscPosition', label: 'Avg Position', width: '140px', group: 'Search Console' },
    { key: 'mainKeyword', label: 'Main Keyword', width: '180px', group: 'Search Console' },
    { key: 'mainKwPosition', label: 'Main KW Position', width: '140px', group: 'Search Console' },
    { key: 'mainKwVolume', label: 'Search Volume', width: '130px', group: 'Search Console' },
    { key: 'bestKeyword', label: 'Best Keyword', width: '180px', group: 'Search Console' },
    { key: 'bestKwPosition', label: 'Best KW Position', width: '140px', group: 'Search Console' },
    { key: 'bestKwVolume', label: 'Best KW Volume', width: '140px', group: 'Search Console' },



    // Analytics (GA4)
    { key: 'ga4Views', label: 'Views (30d)', width: '140px', group: 'Analytics' },
    { key: 'ga4Sessions', label: 'Sessions (30d)', width: '150px', group: 'Analytics' },
    { key: 'sessionsDeltaAbsolute', label: 'Traffic Δ (Abs)', width: '140px', group: 'Analytics' },
    { key: 'sessionsDeltaPct', label: 'Traffic Δ (%)', width: '120px', group: 'Analytics' },
    { key: 'ga4Users', label: 'Users (30d)', width: '140px', group: 'Analytics' },
    { key: 'ga4BounceRate', label: 'Bounce Rate', width: '140px', group: 'Analytics' },
    { key: 'ga4EngagementTimePerPage', label: 'Avg. Time on Page', width: '160px', group: 'Analytics' },
    { key: 'ga4Conversions', label: 'Conversions', width: '130px', group: 'Analytics' },
    { key: 'ga4ConversionRate', label: 'Conversion Rate', width: '150px', group: 'Analytics' },
    { key: 'ga4GoalCompletions', label: 'Goal Completions', width: '150px', group: 'Analytics' },
    { key: 'ga4EcommerceRevenue', label: 'Ecom Revenue', width: '140px', group: 'Analytics' },
    { key: 'ga4Transactions', label: 'Transactions', width: '120px', group: 'Analytics' },
    { key: 'ga4AddtoCart', label: 'Add to Cart', width: '120px', group: 'Analytics' },
    { key: 'ga4Checkouts', label: 'Checkouts', width: '120px', group: 'Analytics' },
    { key: 'ga4Revenue', label: 'Revenue (Total)', width: '120px', group: 'Analytics' },

    // Backlinks & Authority
    { key: 'authorityScore', label: 'Authority Score', width: '150px', group: 'Authority' },
    { key: 'urlRating', label: 'URL Rating (UR)', width: '150px', group: 'Authority' },
    { key: 'referringDomains', label: 'Ref. Domains', width: '160px', group: 'Authority' },
    { key: 'backlinks', label: 'Backlinks', width: '150px', group: 'Authority' },

    // Strategic Decisions
    { key: 'opportunityScore', label: 'Opportunity Score', width: '150px', group: 'Strategic' },
    { key: 'businessValueScore', label: 'Business Value Score', width: '160px', group: 'Strategic' },
    { key: 'techHealthScore', label: 'Technical Health', width: '140px', group: 'Strategic' },
    { key: 'contentQualityScore', label: 'Content Quality', width: '140px', group: 'Strategic' },
    { key: 'searchVisibilityScore', label: 'Search Visibility', width: '150px', group: 'Strategic' },
    { key: 'engagementScore', label: 'Engagement', width: '130px', group: 'Strategic' },
    { key: 'recommendedAction', label: 'Recommended Action', width: '220px', group: 'Strategic' },
    { key: 'recommendedActionReason', label: 'Action Reason', width: '300px', group: 'Strategic' },
    { key: 'isLosingTraffic', label: 'Traffic Alert', width: '130px', group: 'Strategic' },
];

export const SEO_ISSUES_TAXONOMY = [
    {
        category: 'Indexability',
        issues: [
            { id: '404', label: '404 Broken Links (Client Error)', type: 'error', condition: (p: any) => p.statusCode >= 400 && p.statusCode < 500 },
            { id: '500', label: '5xx Server Errors', type: 'error', condition: (p: any) => p.statusCode >= 500 },
            { id: 'noindex', label: 'Noindex Pages', type: 'warning', condition: (p: any) => p.metaRobots1?.toLowerCase().includes('noindex') },
            { id: 'blocked_robots', label: 'Blocked by Robots.txt', type: 'error', condition: (p: any) => p.status === 'Blocked by Robots.txt' },
            { id: 'canonical_mismatch', label: 'Canonical Mismatch', type: 'notice', condition: (p: any) => p.canonical && p.canonical !== p.url },
            { id: 'canonical_missing', label: 'Missing Canonical Tag', type: 'warning', condition: (p: any) => !p.canonical },
            { id: 'multiple_canonical', label: 'Multiple Canonical Tags', type: 'error', condition: (p: any) => p.multipleCanonical === true },
            { id: 'canonical_chain', label: 'Canonical Chain', type: 'error', condition: (p: any) => p.canonicalChain === true },
            { id: 'refresh_redirect', label: 'Meta Refresh Redirect', type: 'warning', condition: (p: any) => p.metaRefresh },
            { id: 'not_in_sitemap', label: 'Indexable Pages Not in Sitemap', type: 'warning', condition: (p: any) => p.inSitemap === false && p.statusCode === 200 && p.indexable !== false && p.contentType?.includes('text/html') },
            { id: 'orphan_pages', label: 'Orphan Pages (0 Inlinks)', type: 'warning', condition: (p: any) => p.inlinks === 0 && p.crawlDepth > 0 },
            { id: 'deep_pages', label: 'Pages Deep in Architecture (Depth > 4)', type: 'notice', condition: (p: any) => p.crawlDepth > 4 },
        ]
    },
    {
        category: 'Links & Navigation',
        issues: [
            { id: 'broken_internal_links', label: 'Broken Internal Links', type: 'error', condition: (p: any) => p.brokenInternalLinks > 0 },
            { id: 'too_many_links', label: 'Too Many Links on Page (>3000)', type: 'warning', condition: (p: any) => (p.inlinks + p.outlinks) > 3000 },
            { id: 'internal_redirects', label: 'Internal Links to Redirects (3xx)', type: 'notice', condition: (p: any) => p.redirectsIn > 0 },
            { id: 'only_one_inlink', label: 'Pages with Only 1 Inlink', type: 'notice', condition: (p: any) => p.inlinks === 1 },
            { id: 'insecure_links', label: 'Links to Insecure Pages (HTTP)', type: 'warning', condition: (p: any) => p.insecureLinks > 0 },
        ]
    },
    {
        category: 'Content & Quality',
        issues: [
            { id: 'low_word_count', label: 'Low Word Count (< 200 words)', type: 'warning', condition: (p: any) => p.wordCount > 0 && p.wordCount < 200 },
            { id: 'exact_duplicate', label: 'Exact Duplicate Content', type: 'error', condition: (p: any) => p.exactDuplicate === true },
            { id: 'spelling_errors', label: 'Spelling Errors Found', type: 'notice', condition: (p: any) => p.spellingErrors > 0 },
            { id: 'grammar_errors', label: 'Grammar Errors Found', type: 'notice', condition: (p: any) => p.grammarErrors > 0 },
            { id: 'low_readability', label: 'Low Readability Score', type: 'notice', condition: (p: any) => p.fleschScore > 0 && p.fleschScore < 30 },
            { id: 'lorem_ipsum', label: 'Contains Lorem Ipsum', type: 'warning', condition: (p: any) => p.containsLoremIpsum === true },
        ]
    },
    {
        category: 'Page Titles',
        issues: [
            { id: 'title_missing', label: 'Missing Title Tag', type: 'error', condition: (p: any) => !p.title },
            { id: 'title_empty', label: 'Empty Title Tag', type: 'error', condition: (p: any) => p.title === '' },
            { id: 'title_duplicate', label: 'Duplicate Titles', type: 'warning', condition: (p: any) => p.isDuplicateTitle === true },
            { id: 'title_too_long', label: 'Title Too Long (> 60 chars)', type: 'notice', condition: (p: any) => p.titleLength > 60 },
            { id: 'title_too_short', label: 'Title Too Short (< 30 chars)', type: 'notice', condition: (p: any) => p.titleLength > 0 && p.titleLength < 30 },
            { id: 'title_multiple', label: 'Multiple Title Tags', type: 'error', condition: (p: any) => p.multipleTitles === true },
            { id: 'title_same_as_h1', label: 'Title Same as H1', type: 'notice', condition: (p: any) => p.title && p.h1_1 && p.title === p.h1_1 },
        ]
    },
    {
        category: 'Meta Descriptions',
        issues: [
            { id: 'meta_missing', label: 'Missing Meta Description', type: 'warning', condition: (p: any) => !p.metaDesc },
            { id: 'meta_empty', label: 'Empty Meta Description', type: 'warning', condition: (p: any) => p.metaDesc === '' },
            { id: 'meta_duplicate', label: 'Duplicate Meta Descriptions', type: 'notice', condition: (p: any) => p.isDuplicateMetaDesc === true },
            { id: 'meta_too_long', label: 'Meta Desc Too Long (> 155 chars)', type: 'notice', condition: (p: any) => p.metaDescLength > 155 },
            { id: 'meta_too_short', label: 'Meta Desc Too Short (< 70 chars)', type: 'notice', condition: (p: any) => p.metaDescLength > 0 && p.metaDescLength < 70 },
            { id: 'meta_multiple', label: 'Multiple Meta Descriptions', type: 'error', condition: (p: any) => p.multipleMetaDescs === true },
        ]
    },
    {
        category: 'Headings (H1, H2)',
        issues: [
            { id: 'h1_missing', label: 'Missing H1', type: 'warning', condition: (p: any) => !p.h1_1 },
            { id: 'h1_multiple', label: 'Multiple H1 Tags', type: 'notice', condition: (p: any) => p.multipleH1s === true || !!p.h1_2 },
            { id: 'h1_duplicate', label: 'Duplicate H1 Tags (Across Site)', type: 'warning', condition: (p: any) => p.isDuplicateH1 === true },
            { id: 'h1_too_long', label: 'H1 Too Long (> 70 chars)', type: 'notice', condition: (p: any) => p.h1_1Length > 70 },
            { id: 'h2_missing', label: 'Missing H2 Tags', type: 'notice', condition: (p: any) => !p.h2_1 },
            { id: 'heading_order', label: 'Incorrect Heading Order', type: 'warning', condition: (p: any) => p.incorrectHeadingOrder === true },
        ]
    },
    {
        category: 'Images',
        issues: [
            { id: 'img_missing_alt', label: 'Missing Alt Text', type: 'warning', condition: (p: any) => p.missingAltImages > 0 },
            { id: 'img_long_alt', label: 'Alt Text Too Long (> 100 chars)', type: 'notice', condition: (p: any) => p.longAltImages > 0 },
        ]
    },
    {
        category: 'Performance & UX',
        issues: [
            { id: 'slow_response', label: 'Slow Response Time (> 1.5s)', type: 'warning', condition: (p: any) => p.loadTime > 1500 },
            { id: 'large_page', label: 'Large HTML Size (> 2MB)', type: 'warning', condition: (p: any) => p.sizeBytes > 2000000 },
            { id: 'poor_lcp', label: 'Poor LCP (> 2.5s)', type: 'warning', condition: (p: any) => p.lcp > 2500 },
            { id: 'poor_cls', label: 'Poor CLS (> 0.1)', type: 'warning', condition: (p: any) => p.cls > 0.1 },
            { id: 'poor_inp', label: 'Poor INP (> 200ms)', type: 'warning', condition: (p: any) => p.inp > 200 },
            { id: 'content_decay', label: 'Possible Content Decay', type: 'warning', condition: (p: any) => p.contentDecay === 'Possible Decay' },
        ]
    },
    {
        category: 'Strategic Insights',
        issues: [
            { id: 'low_ctr', label: 'High Impressions, Low CTR', type: 'warning', condition: (p: any) => p.gscImpressions > 1000 && p.gscCtr < 0.01 },
            { id: 'traffic_drop', label: 'Declining Traffic (>10% drop)', type: 'error', condition: (p: any) => p.isLosingTraffic === true },
            { id: 'high_value_low_engagement', label: 'High Value, Low Engagement', type: 'warning', condition: (p: any) => p.businessValueScore > 70 && p.ga4BounceRate > 0.7 },
            { id: 'striking_distance', label: 'Striking Distance Opportunity', type: 'notice', condition: (p: any) => p.opportunityScore > 70 },
            { id: 'thin_content_high_auth', label: 'Thin Content with High Authority', type: 'warning', condition: (p: any) => p.wordCount < 300 && p.authorityScore > 50 },
        ]
    },
    {
        category: 'Security',
        issues: [
            { id: 'http_url', label: 'HTTP URL (Insecure)', type: 'error', condition: (p: any) => p.url?.startsWith('http://') },
            { id: 'mixed_content', label: 'Mixed Content', type: 'error', condition: (p: any) => p.mixedContent === true },
            { id: 'insecure_forms', label: 'Insecure Forms', type: 'error', condition: (p: any) => p.insecureForms === true },
            { id: 'ssl_invalid', label: 'Invalid SSL Certificate', type: 'error', condition: (p: any) => p.url?.startsWith('https://') && p.sslValid === false },
            { id: 'ssl_expiring', label: 'SSL Expiring Within 30 Days', type: 'warning', condition: (p: any) => p.sslIsExpiringSoon === true },
            { id: 'weak_tls', label: 'Weak TLS Protocol', type: 'warning', condition: (p: any) => p.sslIsWeakProtocol === true },
            { id: 'missing_hsts', label: 'Missing HSTS Header', type: 'warning', condition: (p: any) => p.url?.startsWith('https://') && p.hstsMissing === true },
            { id: 'missing_csp', label: 'Missing Content Security Policy', type: 'notice', condition: (p: any) => p.isHtmlPage && p.hasCsp === false },
            { id: 'unsafe_csp', label: 'Unsafe CSP Directives', type: 'notice', condition: (p: any) => p.cspHasUnsafeInline === true || p.cspHasUnsafeEval === true },
            { id: 'missing_x_frame', label: 'Missing X-Frame-Options', type: 'notice', condition: (p: any) => p.isHtmlPage && p.xFrameMissing === true },
            { id: 'missing_x_content_type', label: 'Missing X-Content-Type-Options', type: 'notice', condition: (p: any) => p.isHtmlPage && p.hasXContentTypeOptions === false },
            { id: 'cors_wildcard', label: 'CORS Wildcard Enabled', type: 'notice', condition: (p: any) => p.corsWildcard === true },
            { id: 'insecure_cookies', label: 'Cookies Missing Secure/HttpOnly', type: 'warning', condition: (p: any) => p.insecureCookies > 0 },
            { id: 'cookies_missing_samesite', label: 'Cookies Missing SameSite', type: 'notice', condition: (p: any) => p.cookiesMissingSameSite > 0 },
            { id: 'scripts_without_sri', label: 'External Scripts Without SRI', type: 'notice', condition: (p: any) => p.scriptsWithoutSri > 0 },
            { id: 'exposed_api_keys', label: 'Exposed API Keys in Source', type: 'error', condition: (p: any) => p.exposedApiKeys > 0 },
            { id: 'missing_privacy_link', label: 'Missing Privacy Policy Link', type: 'notice', condition: (p: any) => p.crawlDepth === 0 && p.privacyPageLinked === false },
        ]
    },
    {
        category: 'Accessibility',
        issues: [
            { id: 'missing_main_landmark', label: 'Missing Main Landmark', type: 'notice', condition: (p: any) => p.isHtmlPage && p.hasMainLandmark === false },
            { id: 'forms_without_labels', label: 'Form Inputs Without Labels', type: 'warning', condition: (p: any) => p.formsWithoutLabels > 0 },
            { id: 'zoom_disabled', label: 'Pinch-to-Zoom Disabled', type: 'warning', condition: (p: any) => p.viewportNoScale === true || p.viewportMaxScale1 === true },
            { id: 'generic_link_text', label: 'Generic Link Text', type: 'notice', condition: (p: any) => p.genericLinkTextCount > 0 },
            { id: 'invalid_aria', label: 'Invalid ARIA Roles', type: 'notice', condition: (p: any) => p.invalidAriaCount > 0 },
            { id: 'missing_skip_link', label: 'Missing Skip Navigation Link', type: 'notice', condition: (p: any) => p.isHtmlPage && p.hasSkipLink === false },
            { id: 'tables_without_headers', label: 'Tables Without Headers', type: 'notice', condition: (p: any) => p.tablesWithoutHeaders > 0 },
        ]
    },
    {
        category: 'Advanced Performance',
        issues: [
            { id: 'large_dom', label: 'Large DOM (>1500 nodes)', type: 'warning', condition: (p: any) => p.domNodeCount > 1500 },
            { id: 'huge_dom', label: 'Huge DOM (>3000 nodes)', type: 'error', condition: (p: any) => p.domNodeCount > 3000 },
            { id: 'render_blocking_css', label: 'Render-Blocking CSS (>3)', type: 'notice', condition: (p: any) => p.renderBlockingCss > 3 },
            { id: 'render_blocking_js', label: 'Render-Blocking JS (>2)', type: 'warning', condition: (p: any) => p.renderBlockingJs > 2 },
            { id: 'many_third_party_scripts', label: 'Many 3rd-Party Scripts', type: 'warning', condition: (p: any) => p.thirdPartyScriptCount > 10 },
            { id: 'legacy_image_formats', label: 'Legacy Image Formats Only', type: 'notice', condition: (p: any) => p.legacyFormatImages > 0 && p.modernFormatImages === 0 },
            { id: 'missing_image_dimensions', label: 'Images Missing Width/Height', type: 'warning', condition: (p: any) => p.imagesWithoutDimensions > 0 },
            { id: 'missing_lazy_loading', label: 'Images Missing Lazy Loading', type: 'notice', condition: (p: any) => p.imagesWithoutLazy > 3 },
            { id: 'no_cache_headers', label: 'No Cache Headers', type: 'notice', condition: (p: any) => p.hasCacheControl === false && p.hasEtag === false },
        ]
    },
    {
        category: 'URL Structure',
        issues: [
            { id: 'url_too_long', label: 'URL Too Long (>115 chars)', type: 'warning', condition: (p: any) => p.urlLength > 115 },
            { id: 'url_uppercase', label: 'Uppercase Characters in URL', type: 'notice', condition: (p: any) => p.hasUppercase === true },
            { id: 'url_session_id', label: 'Session ID in URL', type: 'warning', condition: (p: any) => p.hasSessionId === true },
            { id: 'url_encoded_spaces', label: 'Encoded Spaces in URL', type: 'notice', condition: (p: any) => p.hasSpacesEncoded === true },
            { id: 'soft_404', label: 'Soft 404 Page', type: 'warning', condition: (p: any) => p.isSoft404 === true },
        ]
    },
    {
        category: 'Mobile Usability',
        issues: [
            { id: 'missing_viewport', label: 'Missing Viewport Meta Tag', type: 'error', condition: (p: any) => p.isHtmlPage && p.hasViewportMeta === false },
            { id: 'non_device_width_viewport', label: 'Viewport Missing device-width', type: 'notice', condition: (p: any) => p.hasViewportMeta === true && p.viewportWidth === false },
            { id: 'small_tap_targets', label: 'Small Tap Targets', type: 'warning', condition: (p: any) => p.smallTapTargets > 0 },
            { id: 'small_fonts', label: 'Font Size Too Small', type: 'notice', condition: (p: any) => p.smallFontCount > 0 },
        ]
    },
    {
        category: 'International (Hreflang)',
        issues: [
            { id: 'hreflang_missing', label: 'Missing Hreflang Tags', type: 'notice', condition: (p: any) => !Array.isArray(p.hreflang) || p.hreflang.length === 0 },
            { id: 'hreflang_no_self', label: 'Missing Self-Referencing Hreflang', type: 'warning', condition: (p: any) => p.hreflangNoSelf === true },
            { id: 'hreflang_invalid', label: 'Invalid Language Code', type: 'error', condition: (p: any) => p.hreflangInvalid === true },
            { id: 'hreflang_broken', label: 'Hreflang to Broken Page', type: 'error', condition: (p: any) => p.hreflangBroken === true },
        ]
    },
    {
        category: 'Structured Data',
        issues: [
            { id: 'schema_missing', label: 'Missing Structured Data', type: 'notice', condition: (p: any) => !p.schema || (Array.isArray(p.schema) && p.schema.length === 0) },
            { id: 'schema_errors', label: 'Schema Validation Errors', type: 'error', condition: (p: any) => p.schemaErrors > 0 },
            { id: 'schema_warnings', label: 'Schema Validation Warnings', type: 'warning', condition: (p: any) => p.schemaWarnings > 0 },
        ]
    },
    {
        category: 'Mobile & AMP',
        issues: [
            { id: 'amp_missing', label: 'Missing AMP Alternate Link', type: 'notice', condition: (p: any) => !p.amphtml },
            { id: 'mobile_alt_missing', label: 'Missing Mobile Alternate Link', type: 'notice', condition: (p: any) => !p.mobileAlt },
        ]
    },
    {
        category: 'Pagination',
        issues: [
            { id: 'rel_next_missing', label: 'Missing rel="next"', type: 'notice', condition: (p: any) => !p.relNextTag },
            { id: 'rel_prev_missing', label: 'Missing rel="prev"', type: 'notice', condition: (p: any) => !p.relPrevTag },
            { id: 'pagination_noindex', label: 'Paginated Pages set to Noindex', type: 'warning', condition: (p: any) => (p.relNextTag || p.relPrevTag) && p.metaRobots1?.toLowerCase().includes('noindex') },
        ]
    }
];

export const CATEGORIES = [
    { id: 'internal', label: 'Internal', icon: <Database size={14}/>, sub: ['All', 'HTML', 'JavaScript', 'CSS', 'Images', 'PDF'] },
    { id: 'external', label: 'External', icon: <Globe size={14}/>, sub: ['All', 'HTML', 'Images'] },
    { id: 'security', label: 'Security', icon: <Server size={14}/>, sub: ['Mixed Content', 'Insecure Forms', 'Missing HSTS', 'Missing CSP', 'Invalid SSL', 'Insecure Cookies'] },
    { id: 'codes', label: 'Response Codes', icon: <Server size={14}/>, sub: ['Success (2xx)', 'Redirection (3xx)', 'Client Error (4xx)', 'Server Error (5xx)'] },
    { id: 'indexability', label: 'Indexability', icon: <Compass size={14}/>, sub: ['Indexable', 'Non-Indexable', 'Canonicalized', 'Noindex'] },
    { id: 'titles', label: 'Page Titles', icon: <Code size={14}/>, sub: ['Missing', 'Duplicate', 'Over 60 Characters', 'Below 30 Characters'] },
    { id: 'meta', label: 'Meta Description', icon: <Box size={14}/>, sub: ['Missing', 'Duplicate', 'Over 155 Characters', 'Below 70 Characters'] },
    { id: 'headings', label: 'Headings', icon: <Code size={14}/>, sub: ['Missing H1', 'Multiple H1', 'Missing H2', 'Incorrect Order'] },
    { id: 'links', label: 'Links', icon: <LinkIcon size={14}/>, sub: ['Internal', 'External', 'Broken', 'Redirects'] },
    { id: 'images', label: 'Images', icon: <Box size={14}/>, sub: ['Missing Alt', 'Long Alt', 'Has Images'] },
    { id: 'performance', label: 'Performance', icon: <FastForward size={14}/>, sub: ['Slow Pages', 'Large Pages', 'Poor LCP', 'Poor CLS'] },
    { id: 'international', label: 'International', icon: <Globe size={14}/>, sub: ['Missing Hreflang', 'Hreflang Errors'] },
    { id: 'structured', label: 'Structured Data', icon: <Database size={14}/>, sub: ['Missing Schema', 'Schema Errors', 'Schema Warnings'] },
    { id: 'mobile', label: 'Mobile & AMP', icon: <Globe size={14}/>, sub: ['Missing AMP', 'Missing Mobile Alternate'] },
    { id: 'pagination', label: 'Pagination', icon: <LinkIcon size={14}/>, sub: ['Missing rel=next', 'Missing rel=prev', 'Paginated Noindex'] },
    { id: 'architecture', label: 'Site Architecture', icon: <MapIcon size={14}/>, sub: ['Depth 0-2', 'Depth 3-4', 'Depth 5+', 'Orphan Pages'] },
    { id: 'custom', label: 'Custom Extraction', icon: <Search size={14}/>, sub: ['Has Extraction', 'Missing Extraction'] }
];

export const SMART_PRESETS = [
    { id: 'quick-audit', label: 'Quick Audit', desc: 'Errors, missing titles, broken links', categories: ['codes', 'titles', 'links'], columns: ['url', 'statusCode', 'title', 'titleLength', 'metaDesc', 'inlinks', 'outlinks', 'loadTime'] },
    { id: 'full-technical', label: 'Full Technical', desc: 'All technical SEO signals', categories: ['internal', 'codes', 'indexability', 'security', 'performance'], columns: ['url', 'statusCode', 'indexable', 'canonical', 'metaRobots1', 'httpVersion', 'sizeBytes', 'loadTime', 'lcp', 'cls', 'crawlDepth'] },
    { id: 'content-review', label: 'Content Review', desc: 'Titles, headings, readability', categories: ['titles', 'meta', 'headings', 'internal'], columns: ['url', 'title', 'titleLength', 'metaDesc', 'metaDescLength', 'h1_1', 'h1_2', 'h2_1', 'wordCount', 'fleschScore', 'readability'] },
    { id: 'link-audit', label: 'Link Audit', desc: 'Link architecture and depth', categories: ['links', 'architecture'], columns: ['url', 'statusCode', 'crawlDepth', 'folderDepth', 'inlinks', 'uniqueInlinks', 'outlinks', 'externalOutlinks', 'linkScore'] },
];
