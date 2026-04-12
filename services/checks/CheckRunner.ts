import { CheckResult, CheckEvaluator, SiteContext } from './types';
import { CHECK_REGISTRY } from '../CheckRegistry';

export class CheckRunner {
  private evaluators: Map<string, CheckEvaluator> = new Map();

  register(checkId: string, evaluator: CheckEvaluator): void {
    this.evaluators.set(checkId, evaluator);
  }

  registerAll(checks: Record<string, CheckEvaluator>): void {
    Object.entries(checks).forEach(([id, fn]) => this.register(id, fn));
  }

  runChecks(page: any, siteContext: SiteContext, options?: {
    auditModes?: string[];
    industry?: string;
  }): CheckResult[] {
    const results: CheckResult[] = [];
    const activeAuditModes = new Set(options?.auditModes || ['full']);
    const industry = options?.industry || 'all';

    for (const [checkId, evaluator] of this.evaluators) {
      // Look up metadata from CheckRegistry
      const meta = CHECK_REGISTRY.find(c => c.id === checkId);
      if (!meta) continue;

      // Filter by audit mode
      const modeMatch = activeAuditModes.has('full') ||
        meta.auditModes.some(m => activeAuditModes.has(m));
      if (!modeMatch) continue;

      // Filter by industry
      const industryMatch = meta.industries.includes('all' as any) ||
        meta.industries.includes(industry as any);
      if (!industryMatch) continue;

      try {
        const result = evaluator(page, siteContext);
        if (result) results.push(result);
      } catch (err) {
        console.warn(`[CheckRunner] ${checkId} failed:`, err);
      }
    }

    // Sort: critical > warning > info > pass
    const order = { critical: 0, warning: 1, info: 2, pass: 3 };
    return results.sort((a, b) => (order[a.severity] ?? 99) - (order[b.severity] ?? 99));
  }
}

export const tier4Runner = new CheckRunner();
