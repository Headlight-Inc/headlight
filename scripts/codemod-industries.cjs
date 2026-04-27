#!/usr/bin/env node
const fs = require('node:fs');
const path = process.argv[2];

if (!path) {
  console.error('Please provide a file path');
  process.exit(1);
}

let src = fs.readFileSync(path, 'utf8');
let modified = false;

const replacements = [
  ["'real_estate'", "'realEstate'"],
  ['"real_estate"', '"realEstate"'],
  ["'job_board'", "'jobBoard'"],
  ['"job_board"', '"jobBoard"']
];

for (const [from, to] of replacements) {
  if (src.includes(from)) {
    src = src.replaceAll(from, to);
    modified = true;
  }
}

if (modified) {
  fs.writeFileSync(path, src);
  console.log(`Updated industries in ${path}`);
}
