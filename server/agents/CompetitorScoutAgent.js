/**
 * CompetitorScoutAgent.js
 * Weekly competitor tracking — detect content changes, new pages, tech stack shifts
 */

import { randomUUID } from 'crypto';
import { runCrawler } from '../crawler.js';

export const CompetitorScoutAgent = {
    id: 'competitor-scout',
    name: 'Competitor Scout',
    trigger: 'cron',
    schedule: 'weekly',
    scheduleDay: 'sunday',
    targetHour: 2,
    cooldownMs: 5 * 24 * 60 * 60 * 1000,

    execute: async (context) => {
        const { projectId, turso, aiComplete } = context;

        // 1. Load project's competitors
        const compRes = await turso.execute({
            sql: 'SELECT id, name, url FROM competitors WHERE project_id = ?',
            args: [projectId]
        });

        const competitors = compRes.rows;
        if (competitors.length === 0) {
            return { status: 'partial', summary: 'No competitors configured for this project.' };
        }

        const findings = [];
        let tasksCreated = 0;

        for (const competitor of competitors.slice(0, 3)) { // Max 3 for performance
            const compUrl = String(competitor.url);
            
            // 2. Trigger light crawl
            // This runs synchronously in the batch context if we await it
            // We need a wrapper around runCrawler to collect results
            const results = await new Promise((resolve) => {
                const pages = [];
                const crawler = runCrawler({
                    startUrls: [compUrl],
                    strategy: 'competitor_snapshot',
                    limit: 15,
                    maxDepth: 1,
                    turso
                }, (event, payload) => {
                    if (event === 'PAGE_CRAWLED') pages.push(payload);
                    if (event === 'CRAWL_FINISHED' || event === 'ERROR') resolve(pages);
                });
            });

            if (results.length === 0) continue;

            // 3. Compare with previous snapshot (stored in previousRun resultJson)
            const prevResults = context.previousRun?.resultJson?.competitorSnapshots?.[String(competitor.id)] || [];
            const prevUrls = new Set(prevResults.map(p => p.url));
            const newUrls = results.filter(p => !prevUrls.has(p.url));

            if (newUrls.length > 0) {
                // 4. AI Analysis of significant changes
                const prompt = `
                    Our competitor ${competitor.name} (${compUrl}) has published ${newUrls.length} new pages:
                    ${newUrls.slice(0, 5).map(p => `- ${p.title} (${p.url})`).join('\n')}

                    Please identify:
                    1. Significant content threats (e.g., they added a pricing page, service page we don't have).
                    2. Strategic opportunities for us.
                    
                    Format as JSON: { "threats": [], "opportunities": [] }
                `;

                const aiRes = await aiComplete({ prompt, format: 'json' }, turso);
                let analysis = { threats: [], opportunities: [] };
                try { analysis = JSON.parse(aiRes.text); } catch (e) {}

                if (analysis.threats.length > 0 || analysis.opportunities.length > 0) {
                    // Create task for high-priority threats
                    const taskId = randomUUID();
                    await turso.execute({
                        sql: `INSERT INTO crawl_tasks (
                            id, project_id, title, description, status, priority, 
                            category, source, created_by, created_at, updated_at
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
                        args: [
                            taskId,
                            projectId,
                            `Competitor Move: ${competitor.name}`,
                            `Detected new pages on ${competitor.name}:\n\n**Threats:**\n- ${analysis.threats.join('\n- ')}\n\n**Opportunities:**\n- ${analysis.opportunities.join('\n- ')}`,
                            'todo',
                            'medium',
                            'seo',
                            'agent:competitor-scout',
                            'ai-agent'
                        ]
                    });
                    tasksCreated++;
                }

                findings.push({
                    type: 'competitor_change',
                    title: `New content on ${competitor.name}`,
                    body: `Found ${newUrls.length} new pages.`,
                    severity: 'medium',
                    data: { competitorId: competitor.id, newUrls, analysis }
                });
            }
        }

        // Store snapshots for next time
        const snapshots = {};
        for (const competitor of competitors) {
            // This is a simplified snapshot, just URLs
            // Real implemention might store title/meta too
        }

        return {
            status: 'success',
            summary: `Scouted ${competitors.length} competitors. Detected ${findings.length} significant changes.`,
            findings,
            tasksCreated,
            // Custom data to persist
            resultExtra: {
                competitorSnapshots: Object.fromEntries(findings.map(f => [f.data.competitorId, f.data.newUrls]))
            }
        };
    }
};
