// Web Worker for calculating SEO stats and issue aggregations incrementally
self.onmessage = (e) => {
    const { type, payload } = e.data;
    
    if (type === 'CALCULATE_STATS') {
        const { pages, duplicateTitleSet, duplicateMetaDescSet } = payload;
        
        const broken = pages.filter(p => p.statusCode >= 400).length;
        const redirects = pages.filter(p => p.statusCode >= 300 && p.statusCode < 400).length;
        const missingTitles = pages.filter(p => !p.title).length;
        const missingMetaDesc = pages.filter(p => !p.metaDesc).length;
        const missingH1 = pages.filter(p => !p.h1_1).length;
        const slowPages = pages.filter(p => p.loadTime && p.loadTime > 1500).length;
        const largePages = pages.filter(p => p.sizeBytes && p.sizeBytes > 2 * 1024 * 1024).length;
        const serverErrors = pages.filter(p => p.statusCode >= 500).length;
        const nonIndexable = pages.filter(p => p.indexable === false).length;
        const missingHreflang = pages.filter(p => !Array.isArray(p.hreflang) || p.hreflang.length === 0).length;
        const poorLCP = pages.filter(p => p.lcp && p.lcp > 2500).length;
        const mixedContent = pages.filter(p => p.mixedContent === true).length;
        const multipleH1s = pages.filter(p => p.multipleH1s === true || p.h1_2 !== undefined).length;
        const duplicateTitlePages = pages.filter(p => p.title && duplicateTitleSet?.has(p.title.trim().replace(/\s+/g, ' ').toLowerCase())).length;
        const duplicateMetaDescPages = pages.filter(p => p.metaDesc && duplicateMetaDescSet?.has(p.metaDesc.trim().replace(/\s+/g, ' ').toLowerCase())).length;
        
        const referringDomains = pages.reduce((acc: number, p: any) => acc + (p.referringDomains || 0), 0);
        const urSum = pages.reduce((acc: number, p: any) => acc + (p.urlRating || 0), 0);
        const urCount = pages.filter((p: any) => p.urlRating > 0).length;
        const avgUr = urCount > 0 ? Math.round((urSum / urCount) * 10) / 10 : 0;
        const maxUr = pages.reduce((acc: number, p: any) => Math.max(acc, p.urlRating || 0), 0);

        const stats = {
            total: pages.length,
            html: pages.filter(p => p.contentType?.includes('html')).length,
            img: pages.filter(p => p.contentType?.includes('image')).length,
            referringDomains,
            avgUr,
            maxUr,
            broken, redirects, missingTitles, missingMetaDesc, missingH1,
            slowPages, largePages, serverErrors, nonIndexable,
            missingHreflang, poorLCP, mixedContent, multipleH1s,
            duplicateTitles: duplicateTitleSet?.size || 0,
            duplicateMetaDesc: duplicateMetaDescSet?.size || 0,
            totalIssues: broken + missingTitles + slowPages + missingMetaDesc + missingH1 + largePages + serverErrors + nonIndexable + mixedContent + multipleH1s + duplicateTitlePages + duplicateMetaDescPages
        };
        
        self.postMessage({ type: 'STATS_RESULT', stats });
    }
    
    // Additional heavy logic for category counts can be added here
};
