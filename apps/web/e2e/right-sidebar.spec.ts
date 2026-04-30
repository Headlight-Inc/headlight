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

test.describe('Right Sidebar QA Matrix', () => {
  for (const fixture of fixtures) {
    test.describe(`State: ${fixture.name}`, () => {
      for (const mode of modes) {
        test(`Mode: ${mode}`, async ({ page }) => {
          // Navigate to the specific mode for this fixture
          await page.goto(`${fixture.url}&mode=${mode}`);
          
          // Wait for the sidebar shell to be present
          const shell = page.locator('#rs-shell');
          await expect(shell).toBeVisible({ timeout: 10000 });
          
          // Identify all tabs in the tab bar
          const tabButtons = page.locator('#rs-tab-bar [role="tab"]');
          const tabCount = await tabButtons.count();
          
          // We expect at least some tabs (usually 5)
          expect(tabCount).toBeGreaterThan(0);
          
          for (let i = 0; i < tabCount; i++) {
            const tab = tabButtons.nth(i);
            const tabLabel = (await tab.textContent())?.trim() || `tab-${i}`;
            const tabId = await tab.getAttribute('data-tab-id') || await tab.getAttribute('id') || `tab-${i}`;
            
            // Click the tab to switch
            await tab.click();
            
            // Allow a small amount of time for any micro-animations or data processing
            await page.waitForTimeout(200);
            
            // Ensure no error component is rendered
            const errorView = page.locator('#rs-error');
            await expect(errorView).not.toBeVisible();
            
            // Ensure no major crashes (the shell should still be there)
            await expect(shell).toBeVisible();

            // Take a snapshot for the baseline
            // Note: In a real CI environment, these would be compared against baselines
            await page.screenshot({ 
              path: `__snapshots__/right-sidebar/${fixture.name}/${mode}/${tabId}.png`,
              fullPage: false 
            });
            
            // Basic functional check: In 'full' state, we expect at least one card or KPI tile
            if (fixture.name === 'full') {
              const content = page.locator('#rs-content');
              // We expect either a card, a row, or a kpi strip to have content
              const hasContent = await content.locator('.rs-card, .rs-row, .rs-kpi-tile').count();
              expect(hasContent).toBeGreaterThan(0);
            }
            
            // In 'empty' state, we might expect RsEmpty
            if (fixture.name === 'empty') {
              const isEmpty = await page.locator('.rs-empty').count();
              const isPartial = await page.locator('.rs-partial').count();
              expect(isEmpty + isPartial).toBeGreaterThan(0);
            }
          }
        });
      }
    });
  }
});
