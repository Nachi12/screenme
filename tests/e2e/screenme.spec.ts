import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
import {
  buildValidResumePdfBuffer,
  FICTIONAL_FRESHER_RESUME_LINES,
  REALISTIC_FRESHER_JD,
} from './fixtures.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const screenshotDir = path.join(__dirname, 'screenshots');

test.describe('ScreenMe End-to-End Verification (Real Local Servers)', () => {
  test.beforeAll(async () => {
    await fs.mkdir(screenshotDir, { recursive: true });
  });

  test('completes full 14-step user journey from upload through PDF export, history, and authorized deletion', async ({
    page,
    request,
    browser,
  }) => {
    const consoleErrors: string[] = [];
    const requestedChunks: string[] = [];

    page.on('pageerror', (err) => consoleErrors.push(err.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    page.on('request', (req) => {
      if (req.url().includes('/assets/') && req.url().endsWith('.js')) {
        requestedChunks.push(req.url());
      }
    });

    // 1. Open ScreenMe landing page and register an isolated test user so history/auth deletion works end-to-end
    const uniqueEmail = `e2e.candidate.${Date.now()}@example.com`;
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    expect(requestedChunks.some((u) => u.includes('charts-vendor'))).toBe(false);

    await page.goto('/auth');
    await page.getByRole('button', { name: /Need an account\? Sign up/i }).click();
    await page.locator('#auth-name').fill('Aarav Kulkarni');
    await page.locator('#auth-email').fill(uniqueEmail);
    await page.locator('#auth-password').fill('ScreenMeTest!2026');
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL(/\/dashboard/);

    // 2. Navigate to Analyze and verify client-side validation on empty submission
    await page.goto('/analyze');
    await expect(page.locator('#experience-level')).toBeVisible();
    expect(requestedChunks.some((u) => u.includes('charts-vendor'))).toBe(false);

    await page.getByRole('button', { name: 'Run ScreenMe Analysis' }).click();
    await expect(page.locator('body')).toContainText(/upload/i);

    // 3. Upload valid PDF resume
    const pdfBuffer = buildValidResumePdfBuffer(FICTIONAL_FRESHER_RESUME_LINES);
    const uploadPromise = page.waitForResponse(
      (res) => res.url().includes('/api/v1/resumes/upload') && res.request().method() === 'POST'
    );
    await page.locator('input[aria-label="Upload resume file"]').setInputFiles({
      name: 'Aarav_Kulkarni_Fresher_Resume.pdf',
      mimeType: 'application/pdf',
      buffer: pdfBuffer,
    });
    const uploadRes = await uploadPromise;
    expect(uploadRes.status()).toBe(201);
    await expect(page.getByText(/Ready:\s*Aarav_Kulkarni_Fresher_Resume\.pdf/)).toBeVisible();

    // 4. Paste the Job Description
    await page.locator('#job-title').fill('Junior Full-Stack Software Engineer');
    await page.locator('#company-name').fill('PayFlow Systems');
    await page
      .getByPlaceholder(/Paste the full job description/i)
      .fill(REALISTIC_FRESHER_JD);

    // 5. Select Fresher
    await page.locator('#experience-level').selectOption('fresher');

    // 6. Start analysis
    const createAnalysisPromise = page.waitForResponse(
      (res) => res.url().endsWith('/api/v1/analyses') && res.request().method() === 'POST'
    );
    await page.getByRole('button', { name: 'Run ScreenMe Analysis' }).click();
    const createRes = await createAnalysisPromise;
    expect(createRes.status()).toBe(202);

    // 7. Observe analysis progress
    await expect(page.getByText('Running ScreenMe Analysis Pipeline...')).toBeVisible();

    // 8. Open the completed report (auto-navigates to /reports/:reportId)
    await page.waitForURL(/\/reports\/[a-f0-9]+/i, { timeout: 60_000 });
    const reportUrl = page.url();
    const reportId = reportUrl.split('/reports/')[1]?.split('?')[0] ?? '';
    expect(reportId.length).toBeGreaterThan(5);
    await expect(page.getByText('Fresher Mode Active')).toBeVisible();

    // 9. Review ATS Compatibility and HR Evaluation findings
    await page.getByRole('button', { name: 'ATS Compatibility' }).click();
    await expect(
      page.getByRole('heading', { name: 'ATS Compatibility Evaluation' })
    ).toBeVisible();

    await page.getByRole('button', { name: 'HR Evaluation' }).click();
    await expect(
      page.getByRole('heading', { name: 'HR Recruiter Screening Report' })
    ).toBeVisible();

    // 10. Inspect missing skills and evidence classifications
    await page.getByRole('button', { name: 'Skills Analysis' }).click();
    await expect(
      page.getByRole('heading', { name: 'Skill Evidence Classification' })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Detailed Skill Gaps & Next Actions' })
    ).toBeVisible();

    // 11. Export the PDF
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('link', { name: /Export PDF/i }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/^screenme-report-.*\.pdf$/);

    // 12. Verify the generated PDF bytes directly
    const downloadPath = await download.path();
    expect(downloadPath).not.toBeNull();
    if (downloadPath) {
      const exportedBytes = await fs.readFile(downloadPath);
      expect(exportedBytes.subarray(0, 5).toString('utf8')).toBe('%PDF-');
      expect(exportedBytes.length).toBeGreaterThan(1500);
    }

    // Also verify PDF export API headers directly
    const pdfApiRes = await request.get(`/api/v1/reports/${reportId}/export/pdf`);
    expect(pdfApiRes.status()).toBe(200);
    expect(pdfApiRes.headers()['content-type']).toContain('application/pdf');

    // 13. Open report history on Dashboard
    await page.goto('/dashboard');
    await expect(page.getByText('Junior Full-Stack Software Engineer')).toBeVisible();

    // 14. Authorization check: a separate user context MUST receive 403 when reading or deleting this report
    const intruderContext = await browser.newContext();
    try {
      const intruderEmail = `e2e.intruder.${Date.now()}@example.com`;
      const regRes = await intruderContext.request.post('/api/v1/auth/register', {
        data: {
          name: 'Unauthorized User',
          email: intruderEmail,
          password: 'IntruderTest!2026',
        },
      });
      expect(regRes.status()).toBe(201);

      const forbiddenRead = await intruderContext.request.get(`/api/v1/reports/${reportId}`);
      expect(forbiddenRead.status()).toBe(403);

      const forbiddenDelete = await intruderContext.request.delete(
        `/api/v1/reports/${reportId}`
      );
      expect(forbiddenDelete.status()).toBe(403);
    } finally {
      await intruderContext.close();
    }

    // Owner deletes the report via Dashboard UI and verifies removal
    const deleteResPromise = page.waitForResponse(
      (res) =>
        res.url().includes(`/api/v1/reports/${reportId}`) &&
        res.request().method() === 'DELETE'
    );
    await page
      .getByRole('button', {
        name: /Delete report for Junior Full-Stack Software Engineer/i,
      })
      .click();
    const deleteRes = await deleteResPromise;
    expect(deleteRes.status()).toBe(200);

    await expect(
      page.getByText('Junior Full-Stack Software Engineer')
    ).not.toBeVisible();
    expect(consoleErrors).toEqual([]);
  });

  for (const vp of [
    { name: 'mobile-375', width: 375, height: 812 },
    { name: 'tablet-768', width: 768, height: 1024 },
    { name: 'desktop-1440', width: 1440, height: 900 },
  ]) {
    test(`verifies responsive layout and zero horizontal overflow at ${vp.name}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      for (const route of [
        { url: '/', slug: 'landing' },
        { url: '/analyze', slug: 'analyze' },
        { url: '/sample-report', slug: 'sample-report' },
      ]) {
        await page.goto(route.url);
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

        const overflow = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          innerWidth: window.innerWidth,
        }));
        expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.innerWidth);

        if (route.slug === 'sample-report') {
          await page.getByRole('button', { name: 'Skills Analysis' }).click();
          await expect(
            page.getByRole('heading', { name: 'Skill Evidence Classification' })
          ).toBeVisible();
          await page.getByRole('button', { name: 'Overview' }).click();
        }

        await page.screenshot({
          path: path.join(screenshotDir, `${vp.name}-${route.slug}.png`),
          fullPage: true,
        });
      }
    });
  }
});
