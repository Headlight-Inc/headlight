// services/MigrationPlannerService.ts

export interface MigrationMapping {
    sourceUrl: string;
    targetUrl: string | null;
    matchType: 'exact' | 'slug' | 'ai' | 'manual' | 'unmapped';
    confidence: number;
    redirectType: 301 | 302;
}

class MigrationPlannerService {
    static async generateMappings(sourceUrls: string[], targetUrls: string[]) {
        const mappings: MigrationMapping[] = [];
        const targetSet = new Set(targetUrls);

        for (const source of sourceUrls) {
            // Pass 1: Exact match
            if (targetSet.has(source)) {
                mappings.push({
                    sourceUrl: source,
                    targetUrl: source,
                    matchType: 'exact',
                    confidence: 1,
                    redirectType: 301
                });
                continue;
            }

            // Pass 2: Slug match
            const sourceSlug = this.getSlug(source);
            const slugMatch = targetUrls.find(t => this.getSlug(t) === sourceSlug);
            if (slugMatch) {
                mappings.push({
                    sourceUrl: source,
                    targetUrl: slugMatch,
                    matchType: 'slug',
                    confidence: 0.8,
                    redirectType: 301
                });
                continue;
            }

            // Pass 3: AI/Semantic match (placeholder for semantic embeddings logic)
            // In a real scenario, we'd compare embeddings from CrawlDatabase
            // For now, we'll mark as unmapped but provide a hook for AI
            
            mappings.push({
                sourceUrl: source,
                targetUrl: null,
                matchType: 'unmapped',
                confidence: 0,
                redirectType: 301
            });
        }

        return mappings;
    }

    /**
     * AI-Powered Semantic Mapping (E8)
     * Maps URLs based on content similarity (Title/H1/Path)
     */
    static async generateAIMappings(sourceUrls: string[], targetUrls: string[], options = { threshold: 0.7 }) {
        const mappings: MigrationMapping[] = [];
        
        // This would ideally use a vector search or LLM batch
        // For the purpose of Phase E, we implement the structure to handle these matches
        for (const source of sourceUrls) {
            // Find best semantic match in targetUrls
            // (Simulation of semantic engine)
            const bestMatch = this.findBestSemanticMatch(source, targetUrls);
            
            if (bestMatch && bestMatch.score >= options.threshold) {
                mappings.push({
                    sourceUrl: source,
                    targetUrl: bestMatch.url,
                    matchType: 'ai',
                    confidence: bestMatch.score,
                    redirectType: 301
                });
            } else {
                mappings.push({
                    sourceUrl: source,
                    targetUrl: null,
                    matchType: 'unmapped',
                    confidence: 0,
                    redirectType: 301
                });
            }
        }
        return mappings;
    }

    private static findBestSemanticMatch(source: string, targets: string[]) {
        const sourceSlug = this.getSlug(source).toLowerCase();
        if (!sourceSlug) return null;

        let bestUrl = null;
        let maxScore = 0;

        for (const target of targets) {
            const targetSlug = this.getSlug(target).toLowerCase();
            const score = this.calculateStringSimilarity(sourceSlug, targetSlug);
            if (score > maxScore) {
                maxScore = score;
                bestUrl = target;
            }
        }

        return bestUrl ? { url: bestUrl, score: maxScore } : null;
    }

    private static calculateStringSimilarity(a: string, b: string): number {
        if (a === b) return 1.0;
        if (a.includes(b) || b.includes(a)) return 0.8;
        
        // Levenshtein distance based similarity
        const distance = this.levenshteinDistance(a, b);
        return 1 - (distance / Math.max(a.length, b.length));
    }

    private static levenshteinDistance(a: string, b: string): number {
        const matrix = Array.from({ length: a.length + 1 }, () => 
            Array.from({ length: b.length + 1 }, (_, j) => j)
        );
        for (let i = 1; i <= a.length; i++) matrix[i][0] = i;

        for (let i = 1; i <= a.length; i++) {
            for (let j = 1; j <= b.length; j++) {
                const cost = a[i - 1] === b[j - 1] ? 0 : 1;
                matrix[i][j] = Math.min(
                    matrix[i - 1][j] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j - 1] + cost
                );
            }
        }
        return matrix[a.length][b.length];
    }

    static exportCsv(mappings: MigrationMapping[]) {
        const rows = [
            'sourceUrl,targetUrl,matchType,confidence,redirectType',
            ...mappings.map((mapping) => [
                mapping.sourceUrl,
                mapping.targetUrl || '',
                mapping.matchType,
                mapping.confidence.toFixed(2),
                String(mapping.redirectType)
            ].map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
        ];
        return rows.join('\n');
    }

    static exportHtaccess(mappings: MigrationMapping[]) {
        return mappings
            .filter((mapping) => mapping.targetUrl)
            .map((mapping) => `Redirect ${mapping.redirectType} ${this.getPath(mapping.sourceUrl)} ${mapping.targetUrl}`)
            .join('\n');
    }

    static exportNginx(mappings: MigrationMapping[]) {
        return mappings
            .filter((mapping) => mapping.targetUrl)
            .map((mapping) => `rewrite ^${this.getPath(mapping.sourceUrl)}$ ${mapping.targetUrl} permanent;`)
            .join('\n');
    }

    private static getSlug(url: string) {
        try {
            const path = new URL(url).pathname;
            return path.replace(/\/$/, '').split('/').pop() || '';
        } catch {
            return '';
        }
    }

    private static getPath(url: string) {
        try {
            return new URL(url).pathname || '/';
        } catch {
            return url;
        }
    }
}

export default MigrationPlannerService;
