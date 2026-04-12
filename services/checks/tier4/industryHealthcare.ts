import { CheckResult, CheckEvaluator } from '../types';

export const checkHealthAuthor: CheckEvaluator = (page) => {
  const hasMedicalAuthor = page.industrySignals?.hasMedicalAuthor;
  const isMedicalContent = page.textContent?.toLowerCase().includes('treatment') || page.textContent?.toLowerCase().includes('diagnosis');
  if (!isMedicalContent && !hasMedicalAuthor) return null;

  return {
    checkId: 't4-health-author',
    tier: 4, category: 'healthcare', name: 'Medical Author Attribution',
    severity: hasMedicalAuthor ? 'pass' : 'warning',
    value: { hasMedicalAuthor },
    expected: 'Verified medical author attribution',
    message: hasMedicalAuthor ? 'Medical author attribution found.' : 'Medical content detected without clear author credentials. Critical for E-E-A-T.',
    auditModes: ['full'], industries: ['healthcare']
  };
};

export const checkHealthDisclaimer: CheckEvaluator = (page) => {
  const hasDisclaimer = page.industrySignals?.hasMedicalDisclaimer;
  if (page.crawlDepth !== 0 && !hasDisclaimer) return null;

  return {
    checkId: 't4-health-disclaimer',
    tier: 4, category: 'healthcare', name: 'Medical Disclaimer',
    severity: hasDisclaimer ? 'pass' : 'info',
    value: { hasDisclaimer },
    expected: 'Medical disclaimer on health-related pages',
    message: hasDisclaimer ? 'Medical disclaimer found.' : 'No medical disclaimer detected on the site.',
    auditModes: ['full'], industries: ['healthcare']
  };
};

export const healthcareChecks: Record<string, CheckEvaluator> = {
  't4-health-author': checkHealthAuthor,
  't4-health-disclaimer': checkHealthDisclaimer,
};
