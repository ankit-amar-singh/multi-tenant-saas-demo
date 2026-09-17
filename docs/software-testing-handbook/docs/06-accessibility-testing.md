# ♿ Chapter 6: Accessibility (a11y) & WCAG Auditing

## 1. Overview: The Imperative for Digital Accessibility

Accessibility (a11y) ensures that digital applications are usable by everyone, including people with visual, auditory, motor, or cognitive disabilities. Automating accessibility tests prevents legal non-compliance (ADA / Section 508 / European Accessibility Act) and ensures inclusive user experiences.

---

## 2. WCAG 2.1 & 2.2 Standard Levels: A vs. AA vs. AAA

```
                         WCAG Compliance Pyramid
                                 / \
                                /   \
                               / AAA \  (Specialized Specialized Applications)
                              /-------\
                             /   AA    \  (Global Enterprise Legal Standard)
                            /-----------\
                           /      A      \  (Bare Minimum Operational Baseline)
                          /---------------\
```

| Level | Target Scope | Key Requirements Covered |
| :--- | :--- | :--- |
| **Level A** | Basic Web Accessibility Baseline | Keyboard accessibility, non-text alt content, unique page titles, avoiding color-only indicators. |
| **Level AA** | **Enterprise & Legal Standard** | **4.5:1 minimum color contrast ratio**, visible focus indicators, resizable text up to 200%, clear ARIA roles. |
| **Level AAA** | Specialized High-Accessibility Targets | 7:1 contrast ratio, sign language translations, extended timeouts. |

---

## 3. Automated Accessibility Tooling Stack

Automated scanners (axe-core, Pa11y, Lighthouse) catch ~40%-50% of WCAG violations instantly. The remaining 50% requires manual screen-reader (NVDA/VoiceOver) testing.

```
       Automated Scanners                            Manual Verification
 ┌───────────────────────────┐                  ┌───────────────────────────┐
 │ • axe-core Playwright     │                  │ • Keyboard Tab Focus Trap │
 │ • Pa11y CLI Runner        │  ──────────────► │ • Screen Reader Nav       │
 │ • Lighthouse CI Audits    │                  │ • Target Touch Size 44px  │
 └───────────────────────────┘                  └───────────────────────────┘
```

---

## 4. Playwright + `@axe-core/playwright` Automated Audit Integration

```typescript
// examples/a11y-axe/a11y-audit.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility (a11y) Audit Suite', () => {
  test('Next.js Admin Portal Dashboard should meet WCAG 2.1 AA standards', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForSelector('main');

    // Execute axe scanner with WCAG 2.1 AA tag filters
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag21a', 'wcag2aa', 'wcag21aa'])
      .disableRules(['color-contrast']) // Optional override if dark-mode glassmorphism requires exception
      .analyze();

    // Assert zero critical accessibility violations
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Form elements should feature accessible labels and visible focus rings', async ({ page }) => {
    await page.goto('http://localhost:3000/login');

    const emailInput = page.locator('input[type="email"]');
    await emailInput.focus();

    // Verify focus outline state
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBe('INPUT');
  });
});
```

---

## 5. Lighthouse CI Configuration (`.lighthouserc.json`)

Integrate Lighthouse CI into GitHub Actions PR pipelines to enforce accessibility scores:

```json
{
  "ci": {
    "collect": {
      "numberOfRuns": 3,
      "startServerCommand": "pnpm run dev",
      "url": ["http://localhost:3000/login", "http://localhost:3000/dashboard"]
    },
    "assert": {
      "assertions": {
        "categories:accessibility": ["error", { "minScore": 0.95 }],
        "categories:best-practices": ["error", { "minScore": 0.90 }],
        "color-contrast": "error",
        "label": "error"
      }
    }
  }
}
```
