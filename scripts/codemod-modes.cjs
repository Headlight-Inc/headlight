#!/usr/bin/env node
const fs = require('node:fs');
const path = process.argv[2];

if (!path) {
  console.error('Please provide a file path');
  process.exit(1);
}

const MAP = {
  full: 'fullAudit',
  website_quality: 'wqa',
  technical_seo: 'technical',
  on_page_seo: 'wqa',
  off_page: 'linksAuthority',
  local_seo: 'local',
  news_editorial: 'content',
  ai_discoverability: 'ai',
  competitor_gap: 'competitors',
  business: 'wqa',
  accessibility: 'technical',
  security: 'technical',
};

let src = fs.readFileSync(path, 'utf8');
let modified = false;

for (const [from, to] of Object.entries(MAP)) {
  // Only quoted string occurrences. Don't touch identifiers.
  const fromQuoted1 = `'${from}'`;
  const toQuoted1 = `'${to}'`;
  const fromQuoted2 = `"${from}"`;
  const toQuoted2 = `"${to}"`;

  if (src.includes(fromQuoted1)) {
    src = src.replaceAll(fromQuoted1, toQuoted1);
    modified = true;
  }
  if (src.includes(fromQuoted2)) {
    src = src.replaceAll(fromQuoted2, toQuoted2);
    modified = true;
  }
}

if (modified) {
  fs.writeFileSync(path, src);
  console.log(`Updated modes in ${path}`);
}
