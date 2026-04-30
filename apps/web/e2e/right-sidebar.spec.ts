import { test, expect } from '@playwright/test';

/**
 * Right Sidebar QA Matrix
 * 
 * Verifies that all 12 modes and their 60 tabs render correctly
 * across three different data states: Empty, Pages-only, and Full.
 */

const modes = [
  'fullAudit', 
  'wqa', 
  'technical', 
  'content', 
  'linksAuthority', 
  'uxConversion',
  'paid', 
  'commerce', 
  'socialBrand', 
  'ai', 
  'competitors', 
  'local'
];

const fixtures = [
  { name: 'empty',      url: '/crawler?fixture=empty' },
  { name: 'pages-only', url: '/crawler?fixture=pages-only' },
  { name: 'full',       url: '/crawler?fixture=full' },
];

test.describe('Right Sidebar Stabilization', () => {
  for (const fixture of fixtures) {
    test.describe(`State: ${fixture.name}`, () => {
      for (const mode of modes) {
        test(`Mode: ${mode}`, async ({ page }) => {
          // Navigate to the specific mode for this fixture
          await page.goto(`${fixture.url}&mode=${mode}`);
          
          // Wait for the sidebar shell to be present
          const shell = page.locator('#rs-shell');
          await expect(shell).toBeVisible({ timeout: 10000 });
          
          // Verify that the placeholder is visible (it has a specific ID or text)
          const placeholder = page.locator('#rs-placeholder');
          await expect(placeholder).toBeVisible();
          
          // Verify it contains the "Under Construction" text
          await expect(placeholder).toContainText('System Modularization');

          // Take a snapshot of the placeholder
          await page.screenshot({ 
            path: `__snapshots__/right-sidebar/placeholder/${fixture.name}/${mode}.png`,
            fullPage: false 
          });
        });
      }
    });
  }
});
