// This is a UI-only smoke test: it checks the app shell renders and the
// login/register views wire up correctly, without needing a live backend.
// A great advanced exercise is extending this to run against the full
// docker-compose stack (frontend + backend + db) inside a CI job.
import { test, expect } from '@playwright/test';

test('loads the login page', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Log in' })).toBeVisible();
});

test('can switch to the register form and back', async ({ page }) => {
  await page.goto('/');
  await page.getByText('Need an account? Register').click();
  await expect(page.getByRole('heading', { name: 'Register' })).toBeVisible();

  await page.getByText('Already have an account? Log in').click();
  await expect(page.getByRole('heading', { name: 'Log in' })).toBeVisible();
});
