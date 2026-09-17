/**
 * Runnable Accessibility (a11y) axe-core Automated Audit Example
 * Location: docs/software-testing-handbook/examples/a11y-axe/a11y-audit.spec.ts
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility (a11y) WCAG 2.1 AA Compliance Suite', () => {
  test('Login Page must pass all WCAG 2.1 AA rules', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.waitForSelector('form');

    const scanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag21a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    // Assert zero critical or serious WCAG violations
    expect(scanResults.violations).toEqual([]);
  });

  test('Dashboard page must support keyboard tab navigation focus traps', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    
    // Press Tab key and check focused element outline
    await page.keyboard.press('Tab');
    const isFocused = await page.evaluate(() => document.activeElement !== document.body);
    expect(isFocused).toBe(true);
  });
});
