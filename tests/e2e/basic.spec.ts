import { test, expect } from '@playwright/test';

test('basic test', async ({ page }) => {
  await page.goto('file://' + process.cwd() + '/src/public/debug.html');
  const title = await page.title();
  expect(title).toBe('Debug');
});
