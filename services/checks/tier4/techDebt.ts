import { CheckResult, CheckEvaluator, SiteContext } from '../types';

export const checkCarbonFootprint: CheckEvaluator = (page) => {
  if (page.co2Mg === undefined || !page.carbonRating) return null;
  const rating = page.carbonRating;
  const severity = ['A', 'B'].includes(rating) ? 'pass' : rating === 'C' ? 'info' : 'warning';
  
  return {
    checkId: 't4-carbon-footprint',
    tier: 4, category: 'tech_debt', name: 'Carbon Footprint',
    severity,
    value: { co2: page.co2Mg, rating: page.carbonRating },
    expected: 'Eco-friendly carbon rating (A or B)',
    message: `Page carbon rating is ${rating} (${page.co2Mg}mg CO2).`,
    auditModes: ['full'], industries: ['all']
  };
};

export const checkCookieCompliance: CheckEvaluator = (page) => {
  if (page.crawlDepth !== 0) return null;
  const hasBanner = page.hasCookieBanner;
  
  return {
    checkId: 't4-cookie-compliance',
    tier: 4, category: 'tech_debt', name: 'Cookie Compliance',
    severity: hasBanner ? 'pass' : 'info',
    value: { hasCookieBanner: hasBanner },
    expected: 'Cookie consent banner present',
    message: hasBanner ? 'Cookie consent banner found.' : 'No cookie consent banner detected. Required for GDPR/CCPA.',
    auditModes: ['full'], industries: ['all']
  };
};

export const checkPrivacyGdpr: CheckEvaluator = (page) => {
  if (page.crawlDepth !== 0) return null;
  const hasPrivacy = page.privacyPageLinked;
  const hasBanner = page.hasCookieBanner;
  const severity = (hasPrivacy && hasBanner) ? 'pass' : (hasPrivacy || hasBanner) ? 'info' : 'warning';
  
  return {
    checkId: 't4-privacy-gdpr',
    tier: 4, category: 'tech_debt', name: 'Privacy & GDPR Signals',
    severity,
    value: { privacy: hasPrivacy, cookies: hasBanner },
    expected: 'Privacy policy and cookie banner present',
    message: (hasPrivacy && hasBanner) 
      ? 'Privacy policy and cookie banner detected.' 
      : (hasPrivacy || hasBanner) 
        ? 'Partial compliance signals found.' 
        : 'No privacy policy or cookie banner found.',
    auditModes: ['full'], industries: ['all']
  };
};

export const checkAccessibilityStatement: CheckEvaluator = (page, ctx) => {
  if (page.crawlDepth !== 0) return null;
  const hasA11y = ctx?.allPages.some(p => /(accessibility|a11y-statement)/i.test(p.url));
  
  return {
    checkId: 't4-accessibility-statement',
    tier: 4, category: 'tech_debt', name: 'Accessibility Statement',
    severity: hasA11y ? 'pass' : 'info',
    value: { hasA11y },
    expected: 'Accessibility statement link',
    message: hasA11y ? 'Accessibility statement found.' : 'No accessibility statement found on site.',
    auditModes: ['full', 'accessibility'], industries: ['all']
  };
};

export const checkTechStackAge: CheckEvaluator = (page) => {
  // TODO: Extract specific library versions in crawlerWorker
  // For now check detectedLibraries if available
  const deprecated = page.detectedLibraries || [];
  const severity = deprecated.length > 0 ? 'warning' : 'pass';
  
  return {
    checkId: 't4-tech-stack-age',
    tier: 4, category: 'tech_debt', name: 'Tech Stack Age',
    severity,
    value: { deprecated },
    expected: 'Modern, up-to-date libraries',
    message: deprecated.length > 0 
      ? `Detected deprecated libraries: ${deprecated.join(', ')}` 
      : 'No common legacy libraries detected.',
    auditModes: ['full', 'technical_seo'], industries: ['all']
  };
};

export const techDebtChecks: Record<string, CheckEvaluator> = {
  't4-carbon-footprint': checkCarbonFootprint,
  't4-cookie-compliance': checkCookieCompliance,
  't4-privacy-gdpr': checkPrivacyGdpr,
  't4-accessibility-statement': checkAccessibilityStatement,
  't4-tech-stack-age': checkTechStackAge,
};
