import { CheckResult, CheckEvaluator, SiteContext } from '../types';

// t4-pricing-page: Check if site has a pricing page
export const checkPricingPage: CheckEvaluator = (page, ctx) => {
  if (page.crawlDepth !== 0) return null; // Only evaluate at site level
  const hasPricing = page.hasPricingPage || 
    ctx?.allPages.some(p => /(pricing|plans|packages|price)/i.test(p.url));
  
  return {
    checkId: 't4-pricing-page',
    tier: 4, category: 'business_signals', name: 'Pricing Page Detection',
    severity: hasPricing ? 'pass' : 'info',
    value: hasPricing,
    expected: true,
    message: hasPricing ? 'Pricing page detected.' : 'No pricing page found. Consider adding one for conversion.',
    auditModes: ['fullAudit', 'ecommerce', 'competitors'],
    industries: ['all']
  };
};

// t4-trust-signals: Privacy policy, terms, SSL badge, reviews, certifications
export const checkTrustSignals: CheckEvaluator = (page) => {
  if (page.crawlDepth !== 0) return null;
  const signals = [
    page.privacyPageLinked,
    page.termsPageLinked,
    page.hasTrustBadges,
    page.hasTestimonials || page.hasCaseStudies || page.hasCustomerLogos
  ];
  const count = signals.filter(Boolean).length;
  const severity = count >= 3 ? 'pass' : count >= 1 ? 'info' : 'warning';
  
  return {
    checkId: 't4-trust-signals', tier: 4, category: 'business_signals',
    name: 'Trust Signals', severity,
    value: { privacyPolicy: page.privacyPageLinked, terms: page.termsPageLinked, badges: page.hasTrustBadges, socialProof: page.hasTestimonials || page.hasCaseStudies },
    expected: 'At least 3 trust signals present',
    message: severity === 'pass' ? `${count}/4 trust signals found.` : `Only ${count}/4 trust signals found. Missing elements may reduce user confidence.`,
    auditModes: ['fullAudit', 'wqa'], industries: ['all']
  };
};

// t4-cta-analysis: CTA buttons count, placement, text quality
export const checkCTAAnalysis: CheckEvaluator = (page) => {
  if (!page.isHtmlPage || page.statusCode !== 200) return null;
  const ctaCount = page.ctaTexts?.length || 0;
  const hasGenericCTA = page.ctaTexts?.some((t: string) => 
    /^(click here|submit|send|go)$/i.test(t.trim()));
  const severity = ctaCount === 0 ? 'info' : hasGenericCTA ? 'info' : 'pass';
  
  return {
    checkId: 't4-cta-analysis', tier: 4, category: 'business_signals',
    name: 'CTA Analysis', severity,
    value: { count: ctaCount, texts: page.ctaTexts?.slice(0, 5), hasGenericCTA },
    expected: 'At least 1 descriptive CTA per key page',
    message: ctaCount === 0 
      ? 'No CTAs found on this page.' 
      : hasGenericCTA 
        ? `${ctaCount} CTAs found but some use generic text ("click here", "submit").` 
        : `${ctaCount} CTAs found with descriptive text.`,
    auditModes: ['fullAudit', 'wqa', 'ecommerce'], industries: ['all']
  };
};

// t4-contact-info: Phone, email, address found on site
export const checkContactInfo: CheckEvaluator = (page, ctx) => {
  if (page.crawlDepth !== 0) return null;
  const hasEmail = (page.exposedEmails?.length || 0) > 0;
  const contactPages = ctx?.allPages.filter(p => 
    /(contact|about|locations?|reach-us)/i.test(p.url)) || [];
  const hasContactPage = contactPages.length > 0;
  const severity = (hasEmail || hasContactPage) ? 'pass' : 'info';
  
  return {
    checkId: 't4-contact-info', tier: 4, category: 'business_signals',
    name: 'Contact Information', severity,
    value: { hasEmail, hasContactPage, contactPageCount: contactPages.length },
    expected: 'Contact information accessible on the site',
    message: hasContactPage 
      ? `Contact page found. ${hasEmail ? 'Email detected on homepage.' : ''}` 
      : 'No dedicated contact page found. Important for local SEO and trust.',
    auditModes: ['fullAudit', 'local'], industries: ['all']
  };
};

// t4-conversion-paths: Forms, checkout, sign-up flows
export const checkConversionPaths: CheckEvaluator = (page, ctx) => {
  if (page.crawlDepth !== 0) return null;
  const conversionPages = ctx?.allPages.filter(p => 
    /(signup|sign-up|register|checkout|cart|contact|demo|trial|get-started|book)/i.test(p.url)) || [];
  const count = conversionPages.length;
  
  return {
    checkId: 't4-conversion-paths', tier: 4, category: 'business_signals',
    name: 'Conversion Path Detection', severity: count > 0 ? 'pass' : 'info',
    value: { count, urls: conversionPages.map(p => p.url).slice(0, 10) },
    expected: 'At least 1 conversion path',
    message: count > 0 ? `${count} conversion paths detected (signup, demo, checkout, etc.)` : 'No clear conversion paths found.',
    auditModes: ['fullAudit', 'ecommerce'], industries: ['all']
  };
};

export const checkUSPDetection: CheckEvaluator = (page) => {
  if (page.crawlDepth !== 0) return null;
  const text = (page.textContent || '').toLowerCase();
  const uspPatterns = ['only', 'first', 'leading', 'unique', 'best', 'expert', 'premium', 'guaranteed'];
  const detected = uspPatterns.filter(p => text.includes(p));
  const hasUSP = detected.length > 0;
  
  return {
    checkId: 't4-usp-detection', tier: 4, category: 'business_signals',
    name: 'USP Detection', severity: hasUSP ? 'pass' : 'info',
    value: { detected, count: detected.length },
    expected: 'Unique Selling Proposition patterns detected in content',
    message: hasUSP ? `Detected ${detected.length} USP-related keywords.` : 'No clear USP patterns detected on homepage.',
    auditModes: ['fullAudit', 'competitors'], industries: ['all']
  };
};

export const checkTeamPage: CheckEvaluator = (page, ctx) => {
  if (page.crawlDepth !== 0) return null;
  const hasTeam = ctx?.allPages.some(p => /(team|staff|our-people|leadership)/i.test(p.url));
  
  return {
    checkId: 't4-team-page', tier: 4, category: 'business_signals',
    name: 'Team Page Analysis', severity: hasTeam ? 'pass' : 'info',
    value: hasTeam,
    expected: 'Existence of a team or leadership page',
    message: hasTeam ? 'Team page detected.' : 'No dedicated team or leadership page found.',
    auditModes: ['fullAudit'], industries: ['all']
  };
};

export const checkBusinessAge: CheckEvaluator = (page) => {
  if (page.crawlDepth !== 0) return null;
  return {
    checkId: 't4-business-age', tier: 4, category: 'business_signals',
    name: 'Business Age Estimation', severity: 'info',
    value: 'Requires WHOIS API',
    expected: 'Domain age information',
    message: 'Domain age check requires a WHOIS API integration.',
    auditModes: ['fullAudit', 'competitors'], industries: ['all']
  };
};

export const businessSignalChecks: Record<string, CheckEvaluator> = {
  't4-pricing-page': checkPricingPage,
  't4-trust-signals': checkTrustSignals,
  't4-cta-analysis': checkCTAAnalysis,
  't4-contact-info': checkContactInfo,
  't4-conversion-paths': checkConversionPaths,
  't4-usp-detection': checkUSPDetection,
  't4-team-page': checkTeamPage,
  't4-business-age': checkBusinessAge,
};
