import { test, expect } from '@playwright/test';

test('home: computing renders the dashboard with VDOT', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: /Find your.*pace/i })).toBeVisible();

  await page.getByRole('button', { name: /Get my paces/ }).click();

  // The dashboard heading is focused on mount — proves the dashboard rendered.
  await expect(page.getByRole('heading', { name: /Here's the plan\./ })).toBeVisible();

  // VDOT card label (exact match avoids colliding with the standalone-tool blurb).
  await expect(page.getByText('Your VDOT score', { exact: true })).toBeVisible();

  // Predictions card (also exact to avoid the "Race time predictor" tool blurb).
  await expect(page.getByText('Race time predictions · Riegel formula', { exact: true })).toBeVisible();

  // History strip persists the result.
  await expect(page.getByText('Recent', { exact: true })).toBeVisible();
});

test('home: an unrealistic time is blocked by the WR floor', async ({ page }) => {
  await page.goto('/');

  // Open the race dropdown and switch to Marathon. This resets the time to
  // the marathon default (4:15:00).
  await page.getByLabel(/race or training target/i).selectOption('marathon');

  // Type an unrealistic 5-minute marathon and submit.
  await page.locator('input[aria-label="hours"]').first().fill('0');
  await page.locator('input[aria-label="minutes"]').first().fill('5');
  await page.locator('input[aria-label="seconds"]').first().fill('0');
  await page.getByRole('button', { name: /Get my paces/ }).click();

  await expect(page.getByRole('alert')).toContainText(/faster than the world record/i);
  await expect(page.getByRole('heading', { name: /Here's the plan\./ })).not.toBeVisible();
});

test('vo2 page: gender selector switches the delta column', async ({ page }) => {
  await page.goto('/vo2');

  // Switch reference to "Compare vs men" so the YOU column populates.
  await page.getByLabel(/Reference/).selectOption('men');

  // The age-band table is visible with a YOU header.
  await expect(page.getByRole('columnheader', { name: /YOU/ })).toBeVisible();
});
