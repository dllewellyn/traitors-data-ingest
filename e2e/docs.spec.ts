import { test, expect } from '@playwright/test';

test('Swagger UI loads correctly', async ({ page }) => {
  // Navigate to the root URL (where Swagger UI is served)
  await page.goto('/');

  // Check if the title is correct
  await expect(page).toHaveTitle(/Swagger UI/);

  // Check if the swagger-ui container exists
  const swaggerUiContainer = page.locator('#swagger-ui');
  await expect(swaggerUiContainer).toBeVisible();

  // Wait for the UI to load the spec.
  // We check for a specific element that appears when the spec is loaded,
  // e.g., the title of the API or an operation block.
  // The 'wrapper' class is inside the swagger-ui app.
  // We use .first() to avoid strict mode violations if multiple elements match,
  // although usually there's one main wrapper.
  const wrapper = page.locator('.swagger-ui .wrapper').first();
  await expect(wrapper).toBeVisible({ timeout: 15000 });

  // Verify the API title is rendered
  // Swagger UI puts the title in .info .title
  const apiTitle = page.locator('.swagger-ui .info .title');
  await expect(apiTitle).toBeVisible();
  await expect(apiTitle).toContainText('The Traitors UK API');
});

test('OpenAPI spec is accessible', async ({ request }) => {
  const response = await request.get('/openapi.yaml');
  expect(response.ok()).toBeTruthy();
  expect(response.headers()['content-type']).toContain('yaml');

  const text = await response.text();
  expect(text).toContain('openapi: 3.0.3');
  expect(text).toContain('The Traitors UK API');
});
