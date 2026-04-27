import { execSync } from 'node:child_process';

const FORBIDDEN = [
  'ALL_AUDIT_MODES',
  'AUDIT_MODES_LIST',
  'INDUSTRY_FILTERS',
  'WqaSiteMetrics',
  'WqaIndustryStats',
  'LegacyWqaColumn',
  'getWqaColumnsLegacy',
  'getWqaDefaultVisibleColumnsLegacy',
  'detectSiteType',
  'CMSService',
  'SiteFingerprint\\b',
  'PageFingerprint\\b',
  'WQA_COLUMN_PRESETS',
];

const CMD = `git grep -nE "${FORBIDDEN.join('|')}" -- ':!**/__tests__/fixtures/**' ':!**/CHANGELOG.md' ':!docs/**'`;

let hits = '';
try {
  hits = execSync(CMD, { encoding: 'utf8' });
} catch {
  // git grep exits non-zero when no matches are found
}

if (hits.trim().length > 0) {
  console.error('Legacy data-layer identifiers found. Migrate them before merging:\n');
  console.error(hits);
  process.exit(1);
}

console.log('\u2713 No legacy data-layer identifiers in source.');
