import { CheckResult, CheckEvaluator } from '../types';

export const checkLocalSchema: CheckEvaluator = (page, ctx) => {
  if (ctx?.industry !== 'local') return null;
  if (page.crawlDepth !== 0) return null;
  const localTypes = ['LocalBusiness', 'Restaurant', 'Dentist', 'Attorney', 'Service', 'HVACBusiness', 'RepairService'];
  const hasLocalSchema = (page.schemaTypes || []).some((t: string) => localTypes.includes(t));

  return {
    checkId: 't4-local-schema',
    tier: 4, category: 'local', name: 'LocalBusiness Schema',
    severity: hasLocalSchema ? 'pass' : 'info',
    value: { hasLocalSchema },
    expected: 'LocalBusiness schema or specific subtype on homepage',
    message: hasLocalSchema ? 'LocalBusiness schema detected.' : 'No LocalBusiness schema found on homepage.',
    auditModes: ['fullAudit', 'local'], industries: ['local']
  };
};

export const checkLocalMap: CheckEvaluator = (page, ctx) => {
  if (ctx?.industry !== 'local') return null;
  // TODO: extract hasEmbeddedMap in crawlerWorker
  const hasMap = page.hasEmbeddedMap;
  
  return {
    checkId: 't4-local-map',
    tier: 4, category: 'local', name: 'Embedded Map',
    severity: hasMap ? 'pass' : 'info',
    value: { hasMap },
    expected: 'Embedded Google/Apple/Mapbox map',
    message: hasMap ? 'Embedded map detected.' : 'No embedded map found. Useful for local user experience.',
    auditModes: ['fullAudit', 'local'], industries: ['local']
  };
};

export const checkLocalHours: CheckEvaluator = (page, ctx) => {
  if (ctx?.industry !== 'local') return null;
  const schemaStr = JSON.stringify(page.schema || []);
  const hasHours = schemaStr.includes('openingHours') || schemaStr.includes('openingHoursSpecification');

  return {
    checkId: 't4-local-hours',
    tier: 4, category: 'local', name: 'Business Hours Markup',
    severity: hasHours ? 'pass' : 'info',
    value: { hasHours },
    expected: 'Business hours specified in schema',
    message: hasHours ? 'Business hours markup found.' : 'No business hours detected in structured data.',
    auditModes: ['fullAudit', 'local'], industries: ['local']
  };
};

export const checkLocalNAP: CheckEvaluator = (page, ctx) => {
  if (ctx?.industry !== 'local') return null;
  if (page.crawlDepth !== 0) return null;
  
  const hasEmail = (page.exposedEmails || []).length > 0;
  const hasPhone = (page.phoneNumbers || []).length > 0;
  const hasAddress = page.hasPostalAddress;
  const count = [hasEmail, hasPhone, hasAddress].filter(Boolean).length;
  const severity = count === 3 ? 'pass' : count >= 1 ? 'info' : 'warning';

  return {
    checkId: 't4-local-nap',
    tier: 4, category: 'local', name: 'NAP on Page',
    severity,
    value: { hasEmail, hasPhone, hasAddress },
    expected: 'Name, Address, and Phone (NAP) clearly visible on homepage',
    message: `${count}/3 NAP signals (Email, Phone, Address) found on homepage.`,
    auditModes: ['fullAudit', 'local'], industries: ['local']
  };
};

export const localChecks: Record<string, CheckEvaluator> = {
  't4-local-schema': checkLocalSchema,
  't4-local-map': checkLocalMap,
  't4-local-hours': checkLocalHours,
  't4-local-nap': checkLocalNAP,
};
