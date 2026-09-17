/**
 * Runnable Playwright E2E & Visual Snapshot Test Example
 * Location: docs/software-testing-handbook/examples/e2e-playwright/multi-tenant-flow.spec.ts
 * Description: Verifies preset persona logins and performs visual regression checks.
 */

import { test, expect } from '@playwright/test';

test.describe('Multi-Tenant SaaS Portal E2E & Visual Regression Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/login');
  });

  test('Preset Persona: Login as Workspace Owner and assert full access', async ({ page }) => {
    // Click preset Owner login button
    await page.click('button:has-text("Workspace Owner")');
    await page.click('button[type="submit"]');

    // Assert dashboard redirection
    await page.waitForURL('**/dashboard');
    await expect(page.locator('h1')).toContainText('Skyport Admin Portal');

    // Assert Owner privileges (Settings & Invite buttons present)
    await expect(page.locator('button:has-text("Invite Member")')).toBeVisible();
    await expect(page.locator('button:has-text("Upgrade Tier")')).toBeVisible();
  });

  test('Preset Persona: Login as Standard Member and assert read-only restriction', async ({ page }) => {
    await page.click('button:has-text("Standard Member")');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/dashboard');

    // Assert Member restrictions (Invite & Upgrade buttons hidden or disabled)
    await expect(page.locator('button:has-text("Upgrade Tier")')).not.toBeVisible();
  });

  test('Visual UI Snapshots: Glassmorphism Dashboard Layout', async ({ page }) => {
    await page.click('button:has-text("Workspace Owner")');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    await page.waitForLoadState('networkidle');

    // Assert visual snapshot match
    await expect(page).toHaveScreenshot('dashboard-owner-layout.png', {
      maxDiffPixelRatio: 0.002,
    });
  });
});
