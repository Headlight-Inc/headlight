import { CheckResult, CheckEvaluator } from '../types';

export const checkSaasPricing: CheckEvaluator = (page) => {
  const isPricingPage = /(pricing|plans|packages|subscription)/i.test(page.url);
  if (!isPricingPage) return null;
  const hasPricingTable = page.industrySignals?.hasPricingTable;

  return {
    checkId: 't4-saas-pricing',
    tier: 4, category: 'saas', name: 'Pricing Page Quality',
    severity: hasPricingTable ? 'pass' : 'info',
    value: { hasPricingTable },
    expected: 'Structured pricing table on pricing page',
    message: hasPricingTable ? 'Pricing table detected.' : 'Pricing page found but no structured pricing table detected.',
    auditModes: ['full'], industries: ['saas']
  };
};

export const checkSaasDocs: CheckEvaluator = (page) => {
  if (page.crawlDepth !== 0) return null;
  const hasDocs = page.industrySignals?.hasDocsLink;

  return {
    checkId: 't4-saas-docs',
    tier: 4, category: 'saas', name: 'Documentation Quality',
    severity: hasDocs ? 'pass' : 'info',
    value: { hasDocs },
    expected: 'Link to documentation or help center',
    message: hasDocs ? 'Documentation link found.' : 'No clear link to documentation or help center found.',
    auditModes: ['full'], industries: ['saas']
  };
};

export const checkSaasStatusPage: CheckEvaluator = (page) => {
  if (page.crawlDepth !== 0) return null;
  const hasStatus = page.industrySignals?.hasStatusPage;

  return {
    checkId: 't4-saas-status-page',
    tier: 4, category: 'saas', name: 'Status Page',
    severity: hasStatus ? 'pass' : 'info',
    value: { hasStatus },
    expected: 'Link to service status page',
    message: hasStatus ? 'Status page link found.' : 'No service status page link found.',
    auditModes: ['full'], industries: ['saas']
  };
};

export const saasChecks: Record<string, CheckEvaluator> = {
  't4-saas-pricing': checkSaasPricing,
  't4-saas-docs': checkSaasDocs,
  't4-saas-status-page': checkSaasStatusPage,
};
