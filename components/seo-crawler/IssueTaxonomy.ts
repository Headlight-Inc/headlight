// ─── Types ─────────────────────────────────────────────────
export interface TaxonomyIssue {
    id: string;
    checkId: string; // ← NOW REQUIRED, not optional
    label: string;
    type: 'error' | 'warning' | 'notice';
    condition: (page: any) => boolean;
}

export interface TaxonomyGroup {
    category: string;
    issues: TaxonomyIssue[];
}

export const SEO_ISSUES_TAXONOMY: TaxonomyGroup[] = [
    {
        category: 'Indexability',
        issues: [
            { id: '404', checkId: 't1-status-code', label: '404 Broken Links (Client Error)', type: 'error', condition: (p: any) => p.statusCode >= 400 && p.statusCode < 500 },
            { id: '500', checkId: 't1-status-code', label: '5xx Server Errors', type: 'error', condition: (p: any) => p.statusCode >= 500 },
            { id: 'noindex', checkId: 't1-meta-robots', label: 'Noindex Pages', type: 'warning', condition: (p: any) => p.metaRobots1?.toLowerCase().includes('noindex') },
            { id: 'blocked_robots', checkId: 't1-robots-blocked', label: 'Blocked by Robots.txt', type: 'error', condition: (p: any) => p.status === 'Blocked by Robots.txt' },
            { id: 'canonical_mismatch', checkId: 't1-canonical', label: 'Canonical Mismatch', type: 'notice', condition: (p: any) => p.canonical && p.canonical !== p.url },
            { id: 'canonical_missing', checkId: 't1-canonical', label: 'Missing Canonical Tag', type: 'warning', condition: (p: any) => !p.canonical },
            { id: 'multiple_canonical', checkId: 't1-canonical', label: 'Multiple Canonical Tags', type: 'error', condition: (p: any) => p.multipleCanonical === true },
            { id: 'canonical_chain', checkId: 't1-canonical-chain', label: 'Canonical Chain', type: 'error', condition: (p: any) => p.canonicalChain === true },
            { id: 'refresh_redirect', checkId: 't1-redirect-chain', label: 'Meta Refresh Redirect', type: 'warning', condition: (p: any) => p.metaRefresh },
            { id: 'not_in_sitemap', checkId: 't1-sitemap-presence', label: 'Indexable Pages Not in Sitemap', type: 'warning', condition: (p: any) => p.inSitemap === false && p.statusCode === 200 && p.indexable !== false && p.contentType?.includes('text/html') },
            { id: 'orphan_pages', checkId: 't1-orphan', label: 'Orphan Pages (0 Inlinks)', type: 'warning', condition: (p: any) => p.inlinks === 0 && p.crawlDepth > 0 },
            { id: 'deep_pages', checkId: 't1-crawl-depth', label: 'Pages Deep in Architecture (Depth > 4)', type: 'notice', condition: (p: any) => p.crawlDepth > 4 },
            { id: 'directory_listing', checkId: 't1-dir-listing', label: 'Exposed Directory Listing', type: 'error', condition: (p: any) => p.isDirectoryListing },
            { id: 'sensitive_files', checkId: 't1-security', label: 'Exposed Sensitive Files (.env, .git)', type: 'error', condition: (p: any) => p.exposedSensitiveFiles?.length > 0 },
        ]
    },
    {
        category: 'Links & Navigation',
        issues: [
            { id: 'broken_internal_links', checkId: 't1-broken-links', label: 'Broken Internal Links', type: 'error', condition: (p: any) => p.brokenInternalLinks > 0 },
            { id: 'too_many_links', checkId: 't1-outbound-count', label: 'Too Many Links on Page (>3000)', type: 'warning', condition: (p: any) => (p.inlinks + p.outlinks) > 3000 },
            { id: 'internal_redirects', checkId: 't1-redirect-chain', label: 'Internal Links to Redirects (3xx)', type: 'notice', condition: (p: any) => p.redirectsIn > 0 },
            { id: 'only_one_inlink', checkId: 't1-internal-count', label: 'Pages with Only 1 Inlink', type: 'notice', condition: (p: any) => p.inlinks === 1 },
            { id: 'insecure_links', checkId: 't1-mixed-content', label: 'Links to Insecure Pages (HTTP)', type: 'warning', condition: (p: any) => p.insecureLinks > 0 },
            { id: 'generic_anchors', checkId: 't1-links', label: 'Generic Link Text ("click here")', type: 'notice', condition: (p: any) => p.genericLinkTextCount > 5 },
        ]
    },
    {
        category: 'Technical & Performance',
        issues: [
            { id: 'videos_no_poster', checkId: 't1-perf', label: 'Videos Without Poster', type: 'notice', condition: (p: any) => p.videosWithoutPoster > 0 },
            { id: 'no_service_worker', checkId: 't1-pwa', label: 'No Service Worker (PWA)', type: 'notice', condition: (p: any) => !p.hasServiceWorker && p.isHtmlPage && p.crawlDepth === 0 },
        ]
    },
    {
        category: 'Content & Quality',
        issues: [
            { id: 'low_word_count', checkId: 't2-thin-content', label: 'Low Word Count (< 200 words)', type: 'warning', condition: (p: any) => p.wordCount > 0 && p.wordCount < 200 },
            { id: 'exact_duplicate', checkId: 't2-duplicate-content', label: 'Exact Duplicate Content', type: 'error', condition: (p: any) => p.exactDuplicate === true },
            { id: 'spelling_errors', checkId: 't2-spelling', label: 'Spelling Errors Found', type: 'notice', condition: (p: any) => p.spellingErrors > 0 },
            { id: 'grammar_errors', checkId: 't2-grammar', label: 'Grammar Errors Found', type: 'notice', condition: (p: any) => p.grammarErrors > 0 },
            { id: 'low_readability', checkId: 't2-reading-level', label: 'Low Readability Score', type: 'notice', condition: (p: any) => p.fleschScore > 0 && p.fleschScore < 30 },
            { id: 'lorem_ipsum', checkId: 't2-thin-content', label: 'Contains Lorem Ipsum', type: 'warning', condition: (p: any) => p.containsLoremIpsum === true },
        ]
    },
    {
        category: 'Page Titles',
        issues: [
            { id: 'title_missing', checkId: 't2-title-exists', label: 'Missing Title Tag', type: 'error', condition: (p: any) => !p.title },
            { id: 'title_empty', checkId: 't2-title-exists', label: 'Empty Title Tag', type: 'error', condition: (p: any) => p.title === '' },
            { id: 'title_duplicate', checkId: 't2-title-duplicate', label: 'Duplicate Titles', type: 'warning', condition: (p: any) => p.isDuplicateTitle === true },
            { id: 'title_too_long', checkId: 't2-title-length', label: 'Title Too Long (> 60 chars)', type: 'notice', condition: (p: any) => p.titleLength > 60 },
            { id: 'title_too_short', checkId: 't2-title-length', label: 'Title Too Short (< 30 chars)', type: 'notice', condition: (p: any) => p.titleLength > 0 && p.titleLength < 30 },
            { id: 'title_multiple', checkId: 't2-title-exists', label: 'Multiple Title Tags', type: 'error', condition: (p: any) => p.multipleTitles === true },
            { id: 'title_same_as_h1', checkId: 't2-title-keyword', label: 'Title Same as H1', type: 'notice', condition: (p: any) => p.title && p.h1_1 && p.title === p.h1_1 },
        ]
    },
    {
        category: 'Meta Descriptions',
        issues: [
            { id: 'meta_missing', checkId: 't2-meta-desc-exists', label: 'Missing Meta Description', type: 'warning', condition: (p: any) => !p.metaDesc },
            { id: 'meta_empty', checkId: 't2-meta-desc-exists', label: 'Empty Meta Description', type: 'warning', condition: (p: any) => p.metaDesc === '' },
            { id: 'meta_duplicate', checkId: 't2-meta-desc-duplicate', label: 'Duplicate Meta Descriptions', type: 'notice', condition: (p: any) => p.isDuplicateMetaDesc === true },
            { id: 'meta_too_long', checkId: 't2-meta-desc-length', label: 'Meta Desc Too Long (> 155 chars)', type: 'notice', condition: (p: any) => p.metaDescLength > 155 },
            { id: 'meta_too_short', checkId: 't2-meta-desc-length', label: 'Meta Desc Too Short (< 70 chars)', type: 'notice', condition: (p: any) => p.metaDescLength > 0 && p.metaDescLength < 70 },
            { id: 'meta_multiple', checkId: 't2-meta-desc-exists', label: 'Multiple Meta Descriptions', type: 'error', condition: (p: any) => p.multipleMetaDescs === true },
        ]
    },
    {
        category: 'Headings (H1, H2)',
        issues: [
            { id: 'h1_missing', checkId: 't2-h1-exists', label: 'Missing H1', type: 'warning', condition: (p: any) => !p.h1_1 },
            { id: 'h1_multiple', checkId: 't2-h1-multiple', label: 'Multiple H1 Tags', type: 'notice', condition: (p: any) => p.multipleH1s === true || !!p.h1_2 },
            { id: 'h1_duplicate', checkId: 't2-h1-exists', label: 'Duplicate H1 Tags (Across Site)', type: 'warning', condition: (p: any) => p.isDuplicateH1 === true },
            { id: 'h1_too_long', checkId: 't2-h1-length', label: 'H1 Too Long (> 70 chars)', type: 'notice', condition: (p: any) => p.h1_1Length > 70 },
            { id: 'h2_missing', checkId: 't2-heading-hierarchy', label: 'Missing H2 Tags', type: 'notice', condition: (p: any) => !p.h2_1 },
            { id: 'heading_order', checkId: 't2-heading-hierarchy', label: 'Incorrect Heading Order', type: 'warning', condition: (p: any) => p.incorrectHeadingOrder === true },
        ]
    },
    {
        category: 'Images',
        issues: [
            { id: 'img_missing_alt', checkId: 't2-img-alt', label: 'Missing Alt Text', type: 'warning', condition: (p: any) => p.missingAltImages > 0 },
            { id: 'img_long_alt', checkId: 't2-img-alt', label: 'Alt Text Too Long (> 100 chars)', type: 'notice', condition: (p: any) => p.longAltImages > 0 },
        ]
    },
    {
        category: 'Performance & UX',
        issues: [
            { id: 'slow_response', checkId: 't1-server-response', label: 'Slow Response Time (> 1.5s)', type: 'warning', condition: (p: any) => p.loadTime > 1500 },
            { id: 'large_page', checkId: 't1-page-size', label: 'Large HTML Size (> 2MB)', type: 'warning', condition: (p: any) => p.sizeBytes > 2000000 },
            { id: 'poor_lcp', checkId: 't1-lcp', label: 'Poor LCP (> 2.5s)', type: 'warning', condition: (p: any) => p.lcp > 2500 },
            { id: 'poor_cls', checkId: 't1-cls', label: 'Poor CLS (> 0.1)', type: 'warning', condition: (p: any) => p.cls > 0.1 },
            { id: 'poor_inp', checkId: 't1-fid', label: 'Poor INP (> 200ms)', type: 'warning', condition: (p: any) => p.inp > 200 },
            { id: 'content_decay', checkId: 't3-content-decay', label: 'Possible Content Decay', type: 'warning', condition: (p: any) => p.contentDecay === 'Possible Decay' },
        ]
    },
    {
        category: 'Strategic Insights',
        issues: [
            { id: 'low_ctr', checkId: 't3-keyword-opportunity', label: 'High Impressions, Low CTR', type: 'warning', condition: (p: any) => p.gscImpressions > 1000 && p.gscCtr < 0.01 },
            { id: 'traffic_drop', checkId: 't3-content-decay', label: 'Declining Traffic (>10% drop)', type: 'error', condition: (p: any) => p.isLosingTraffic === true },
            { id: 'high_value_low_engagement', checkId: 't3-issue-priority', label: 'High Value, Low Engagement', type: 'warning', condition: (p: any) => p.businessValueScore > 70 && p.ga4BounceRate > 0.7 },
            { id: 'striking_distance', checkId: 't3-keyword-opportunity', label: 'Striking Distance Opportunity', type: 'notice', condition: (p: any) => p.opportunityScore > 70 },
            { id: 'thin_content_high_auth', checkId: 't3-issue-priority', label: 'Thin Content with High Authority', type: 'warning', condition: (p: any) => p.wordCount < 300 && p.authorityScore > 50 },
        ]
    },
    {
        category: 'Security',
        issues: [
            { id: 'http_url', checkId: 't1-https', label: 'HTTP URL (Insecure)', type: 'error', condition: (p: any) => p.url?.startsWith('http://') },
            { id: 'mixed_content', checkId: 't1-mixed-content', label: 'Mixed Content', type: 'error', condition: (p: any) => p.mixedContent === true },
            { id: 'insecure_forms', checkId: 't1-security-headers', label: 'Insecure Forms', type: 'error', condition: (p: any) => p.insecureForms === true },
            { id: 'ssl_invalid', checkId: 't1-ssl-valid', label: 'Invalid SSL Certificate', type: 'error', condition: (p: any) => p.url?.startsWith('https://') && p.sslValid === false },
            { id: 'ssl_expiring', checkId: 't1-ssl-expiry', label: 'SSL Expiring Within 30 Days', type: 'warning', condition: (p: any) => p.sslIsExpiringSoon === true },
            { id: 'weak_tls', checkId: 't1-ssl-valid', label: 'Weak TLS Protocol', type: 'warning', condition: (p: any) => p.sslIsWeakProtocol === true },
            { id: 'missing_hsts', checkId: 't1-hsts', label: 'Missing HSTS Header', type: 'warning', condition: (p: any) => p.url?.startsWith('https://') && p.hstsMissing === true },
            { id: 'missing_csp', checkId: 't1-csp', label: 'Missing Content Security Policy', type: 'notice', condition: (p: any) => p.isHtmlPage && p.hasCsp === false },
            { id: 'unsafe_csp', checkId: 't1-csp', label: 'Unsafe CSP Directives', type: 'notice', condition: (p: any) => p.cspHasUnsafeInline === true || p.cspHasUnsafeEval === true },
            { id: 'missing_x_frame', checkId: 't1-security-headers', label: 'Missing X-Frame-Options', type: 'notice', condition: (p: any) => p.isHtmlPage && p.xFrameMissing === true },
            { id: 'missing_x_content_type', checkId: 't1-security-headers', label: 'Missing X-Content-Type-Options', type: 'notice', condition: (p: any) => p.isHtmlPage && p.hasXContentTypeOptions === false },
            { id: 'cors_wildcard', checkId: 't1-security-headers', label: 'CORS Wildcard Enabled', type: 'notice', condition: (p: any) => p.corsWildcard === true },
            { id: 'insecure_cookies', checkId: 't1-security-cookies', label: 'Cookies Missing Secure/HttpOnly', type: 'warning', condition: (p: any) => p.insecureCookies > 0 },
            { id: 'cookies_missing_samesite', checkId: 't1-security-cookies', label: 'Cookies Missing SameSite', type: 'notice', condition: (p: any) => p.cookiesMissingSameSite > 0 },
            { id: 'scripts_without_sri', checkId: 't1-security-headers', label: 'External Scripts Without SRI', type: 'notice', condition: (p: any) => p.scriptsWithoutSri > 0 },
            { id: 'exposed_api_keys', checkId: 't1-security-headers', label: 'Exposed API Keys in Source', type: 'error', condition: (p: any) => p.exposedApiKeys > 0 },
            { id: 'missing_privacy_link', checkId: 't1-privacy-link', label: 'Missing Privacy Policy Link', type: 'notice', condition: (p: any) => p.crawlDepth === 0 && p.privacyPageLinked === false },
        ]
    },
    {
        category: 'Accessibility',
        issues: [
            { id: 'missing_main_landmark', checkId: 't2-a11y-landmarks', label: 'Missing Main Landmark', type: 'notice', condition: (p: any) => p.isHtmlPage && p.hasMainLandmark === false },
            { id: 'forms_without_labels', checkId: 't2-a11y-form', label: 'Form Inputs Without Labels', type: 'warning', condition: (p: any) => p.formsWithoutLabels > 0 },
            { id: 'zoom_disabled', checkId: 't2-mobile-viewport', label: 'Pinch-to-Zoom Disabled', type: 'warning', condition: (p: any) => p.viewportNoScale === true || p.viewportMaxScale1 === true },
            { id: 'generic_link_text', checkId: 't2-a11y-links', label: 'Generic Link Text', type: 'notice', condition: (p: any) => p.genericLinkTextCount > 0 },
            { id: 'invalid_aria', checkId: 't2-a11y-aria', label: 'Invalid ARIA Roles', type: 'notice', condition: (p: any) => p.invalidAriaCount > 0 },
            { id: 'missing_skip_link', checkId: 't2-a11y-skip-link', label: 'Missing Skip Navigation Link', type: 'notice', condition: (p: any) => p.isHtmlPage && p.hasSkipLink === false },
            { id: 'tables_without_headers', checkId: 't2-a11y-table-headers', label: 'Tables Without Headers', type: 'notice', condition: (p: any) => p.tablesWithoutHeaders > 0 },
        ]
    },
    {
        category: 'Advanced Performance',
        issues: [
            { id: 'large_dom', checkId: 't1-dom-size', label: 'Large DOM (>1500 nodes)', type: 'warning', condition: (p: any) => p.domNodeCount > 1500 },
            { id: 'huge_dom', checkId: 't1-dom-size', label: 'Huge DOM (>3000 nodes)', type: 'error', condition: (p: any) => p.domNodeCount > 3000 },
            { id: 'render_blocking_css', checkId: 't1-render-blocking', label: 'Render-Blocking CSS (>3)', type: 'notice', condition: (p: any) => p.renderBlockingCss > 3 },
            { id: 'render_blocking_js', checkId: 't1-render-blocking', label: 'Render-Blocking JS (>2)', type: 'warning', condition: (p: any) => p.renderBlockingJs > 2 },
            { id: 'many_third_party_scripts', checkId: 't1-third-party', label: 'Many 3rd-Party Scripts', type: 'warning', condition: (p: any) => p.thirdPartyScriptCount > 10 },
            { id: 'legacy_image_formats', checkId: 't2-img-format', label: 'Legacy Image Formats Only', type: 'notice', condition: (p: any) => p.legacyFormatImages > 0 && p.modernFormatImages === 0 },
            { id: 'missing_image_dimensions', checkId: 't2-img-dimensions', label: 'Images Missing Width/Height', type: 'warning', condition: (p: any) => p.imagesWithoutDimensions > 0 },
            { id: 'missing_image_lazy_loading', checkId: 't2-img-lazy', label: 'Images Missing Lazy Loading', type: 'notice', condition: (p: any) => p.imagesWithoutLazy > 3 },
            { id: 'no_cache_headers', checkId: 't1-cache-headers', label: 'No Cache Headers', type: 'notice', condition: (p: any) => p.hasCacheControl === false && p.hasEtag === false },
        ]
    },
    {
        category: 'URL Structure',
        issues: [
            { id: 'url_too_long', checkId: 't1-url-length', label: 'URL Too Long (>115 chars)', type: 'warning', condition: (p: any) => p.urlLength > 115 },
            { id: 'url_uppercase', checkId: 't1-url-normalization', label: 'Uppercase Characters in URL', type: 'notice', condition: (p: any) => p.hasUppercase === true },
            { id: 'url_session_id', checkId: 't1-url-params', label: 'Session ID in URL', type: 'warning', condition: (p: any) => p.hasSessionId === true },
            { id: 'url_encoded_spaces', checkId: 't1-url-encoding', label: 'Encoded Spaces in URL', type: 'notice', condition: (p: any) => p.hasSpacesEncoded === true },
            { id: 'soft_404', checkId: 't1-soft-404', label: 'Soft 404 Page', type: 'warning', condition: (p: any) => p.isSoft404 === true },
        ]
    },
    {
        category: 'Mobile Usability',
        issues: [
            { id: 'missing_viewport', checkId: 't2-mobile-viewport', label: 'Missing Viewport Meta Tag', type: 'error', condition: (p: any) => p.isHtmlPage && p.hasViewportMeta === false },
            { id: 'non_device_width_viewport', checkId: 't2-mobile-viewport', label: 'Viewport Missing device-width', type: 'notice', condition: (p: any) => p.hasViewportMeta === true && p.viewportWidth === false },
            { id: 'small_tap_targets', checkId: 't2-mobile-tap-targets', label: 'Small Tap Targets', type: 'warning', condition: (p: any) => p.smallTapTargets > 0 },
            { id: 'small_fonts', checkId: 't2-mobile-font-size', label: 'Font Size Too Small', type: 'notice', condition: (p: any) => p.smallFontCount > 0 },
        ]
    },
    {
        category: 'International (Hreflang)',
        issues: [
            { id: 'hreflang_missing', checkId: 't2-hreflang', label: 'Missing Hreflang Tags', type: 'notice', condition: (p: any) => !Array.isArray(p.hreflang) || p.hreflang.length === 0 },
            { id: 'hreflang_no_self', checkId: 't2-hreflang', label: 'Missing Self-Referencing Hreflang', type: 'warning', condition: (p: any) => p.hreflangNoSelf === true },
            { id: 'hreflang_invalid', checkId: 't2-hreflang', label: 'Invalid Language Code', type: 'error', condition: (p: any) => p.hreflangInvalid === true },
            { id: 'hreflang_broken', checkId: 't2-hreflang', label: 'Hreflang to Broken Page', type: 'error', condition: (p: any) => p.hreflangBroken === true },
        ]
    },
    {
        category: 'Structured Data',
        issues: [
            { id: 'schema_missing', checkId: 't2-schema-exists', label: 'Missing Structured Data', type: 'notice', condition: (p: any) => !p.schema || (Array.isArray(p.schema) && p.schema.length === 0) },
            { id: 'schema_errors', checkId: 't2-schema-valid', label: 'Schema Validation Errors', type: 'error', condition: (p: any) => p.schemaErrors > 0 },
            { id: 'schema_warnings', checkId: 't2-schema-valid', label: 'Schema Validation Warnings', type: 'warning', condition: (p: any) => p.schemaWarnings > 0 },
        ]
    },
    {
        category: 'Mobile & AMP',
        issues: [
            { id: 'amp_missing', checkId: 't2-amp', label: 'Missing AMP Alternate Link', type: 'notice', condition: (p: any) => !p.amphtml },
            { id: 'mobile_alt_missing', checkId: 't2-mobile-alt', label: 'Missing Mobile Alternate Link', type: 'notice', condition: (p: any) => !p.mobileAlt },
        ]
    },
    {
        category: 'Pagination',
        issues: [
            { id: 'rel_next_missing', checkId: 't2-pagination-rel', label: 'Missing rel="next"', type: 'notice', condition: (p: any) => !p.relNextTag },
            { id: 'rel_prev_missing', checkId: 't2-pagination-rel', label: 'Missing rel="prev"', type: 'notice', condition: (p: any) => !p.relPrevTag },
            { id: 'pagination_noindex', checkId: 't2-pagination-noindex', label: 'Paginated Pages set to Noindex', type: 'warning', condition: (p: any) => (p.relNextTag || p.relPrevTag) && p.metaRobots1?.toLowerCase().includes('noindex') },
        ]
    },
    {
        category: 'Industry Specific',
        issues: [
            { id: 'missing_product_schema', checkId: 't4-ecom-product-schema', label: 'Missing Product Schema (E-com)', type: 'warning', condition: (p: any) => p.industry === 'ecommerce' && !p.industrySignals?.hasProductSchema },
            { id: 'no_pricing_table', checkId: 't4-saas-pricing', label: 'No Pricing Table Detected (SaaS)', type: 'notice', condition: (p: any) => p.industry === 'saas' && !p.industrySignals?.hasPricingTable },
            { id: 'missing_local_schema', checkId: 't4-local-schema', label: 'Missing LocalBusiness Schema', type: 'warning', condition: (p: any) => p.industry === 'local_business' && !p.industrySignals?.hasLocalBusinessSchema },
            { id: 'no_medical_disclaimer', checkId: 't4-health-disclaimer', label: 'Missing Medical Disclaimer', type: 'error', condition: (p: any) => p.industry === 'healthcare' && !p.industrySignals?.hasMedicalDisclaimer },
        ]
    },
    {
        category: 'AI Discoverability',
        issues: [
            { id: 'not_passage_ready', checkId: 't3-passage-indexing', label: 'Poor Passage Indexing Structure', type: 'notice', condition: (p: any) => p.isHtmlPage && p.passageReadiness < 50 && p.wordCount > 500 },
            { id: 'no_snippet_patterns', checkId: 't3-featured-snippet', label: 'No Featured Snippet Patterns', type: 'notice', condition: (p: any) => p.isHtmlPage && !p.hasFeaturedSnippetPatterns && p.wordCount > 300 },
            { id: 'no_speakable_schema', checkId: 't3-voice-search', label: 'Missing Speakable Schema', type: 'notice', condition: (p: any) => p.isHtmlPage && !p.hasSpeakableSchema && p.hasQuestionFormat },
            { id: 'low_voice_search', checkId: 't3-voice-search', label: 'Low Voice Search Readiness', type: 'notice', condition: (p: any) => p.isHtmlPage && p.voiceSearchScore < 40 && p.wordCount > 300 },
            { id: 'missing_llms_txt', checkId: 't3-llms-txt', label: 'Missing /llms.txt', type: 'notice', condition: (p: any) => p.crawlDepth === 0 && !p.hasLlmsTxt },
            { id: 'blocked_ai_bots', checkId: 't3-ai-crawler-rules', label: 'AI Bots Blocked in Robots.txt', type: 'notice', condition: (p: any) => p.crawlDepth === 0 && p.aiBotRules && Object.values(p.aiBotRules).some(v => v === true) },
            { id: 'low_geo_score', checkId: 't3-geo-score', label: 'Low AI Discoverability (GEO) Score', type: 'warning', condition: (p: any) => p.isHtmlPage && p.geoScore < 30 && p.wordCount > 500 },
        ]
    },
    {
        category: 'Technical & Rendering',
        issues: [
            { id: 'js_dependent_content', checkId: 't2-js-render', label: 'Critical Content Requires JavaScript', type: 'warning', condition: (p: any) => p.jsRenderDiff?.criticalContentJsOnly === true },
            { id: 'js_hidden_links', checkId: 't2-js-render', label: 'Internal Links Hidden Behind JavaScript', type: 'warning', condition: (p: any) => p.jsRenderDiff?.jsOnlyLinks > 0 },
            { id: 'js_hidden_images', checkId: 't2-js-render', label: 'Images Hidden Behind JavaScript', type: 'notice', condition: (p: any) => p.jsRenderDiff?.jsOnlyImages > 0 },
            { id: 'js_hidden_schema', checkId: 't2-js-render', label: 'Structured Data Only via JavaScript', type: 'notice', condition: (p: any) => p.jsRenderDiff?.jsOnlySchema === true },
            { id: 'high_js_diff', checkId: 't2-js-render', label: 'High HTML vs Rendered Diff (>50%)', type: 'notice', condition: (p: any) => p.jsRenderDiff?.textDiffPercent > 50 },
            { id: 'visual_regression', checkId: 't1-visual-diff', label: 'Visual Change Detected vs Previous Session', type: 'notice', condition: (p: any) => p.visualChangeDetected === true },
        ]
    },
    {
        category: 'Log Analysis',
        issues: [
            { id: 'never_crawled_by_google', checkId: 't2-log-analysis', label: 'Page Never Visited by Googlebot', type: 'warning', condition: (p: any) => p.googlebotVisits30d === 0 && p.indexable },
            { id: 'bot_5xx_errors', checkId: 't2-log-analysis', label: 'Server Errors Served to Bots', type: 'error', condition: (p: any) => p.botServerErrors > 0 },
            { id: 'high_bot_attention_low_value', checkId: 't2-log-analysis', label: 'Crawl Budget Waste (High bot, low value)', type: 'notice', condition: (p: any) => p.botCrawlBudgetShare > 0.01 && (p.gscImpressions || 0) < 10 },
        ]
    }
];

// ─── Auto-generated from taxonomy (single source of truth) ──
export const ISSUE_TO_CHECK_MAP: Record<string, string> = Object.fromEntries(
    SEO_ISSUES_TAXONOMY.flatMap((group) =>
        group.issues.map((issue) => [issue.id, issue.checkId])
    )
);

export const getPageIssues = (page: any) => {
    const issues: any[] = [];
    for (const group of SEO_ISSUES_TAXONOMY) {
        for (const issue of group.issues) {
            try {
                if (issue.condition(page)) {
                    issues.push({
                        ...issue,
                        category: group.category
                    });
                }
            } catch (err) {
                // Ignore condition errors
            }
        }
    }
    return issues;
};
