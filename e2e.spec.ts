import { test, expect } from '@playwright/test';

test('homepage presents the premium story and featured Dharmawangsa project', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Jasa Kayu Profesional/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Ruang yang terasa hidup');
  await expect(page.getByText('Deck Balkon Apartemen Dharmawangsa')).toBeVisible();
  await expect(page.locator('img[alt="Deck Balkon Apartemen Dharmawangsa"]')).toBeVisible();
  await page.screenshot({ path: 'test-results/homepage.png', fullPage: true });
});

test('portfolio filters and mobile navigation work', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const toggle = page.getByRole('button', { name: 'Buka navigasi' });
  await toggle.click();
  await expect(page.getByRole('navigation', { name: 'Navigasi mobile' })).toBeVisible();
  await page.getByRole('link', { name: 'Karya' }).last().click();
  await expect(page.locator('#portofolio')).toBeInViewport();
  await page.getByRole('tab', { name: 'Komersial' }).click();
  const hiddenCards = page.locator('.portfolio-card.hidden');
  await expect(hiddenCards).not.toHaveCount(0);
});

test('blog hub and new Dharmawangsa guide are crawlable', async ({ page }) => {
  await page.goto('/blog');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Catatan untuk membuat keputusan');
  await expect(page.getByRole('link', { name: /Deck Kayu untuk Balkon Apartemen/i }).first()).toBeVisible();
  await page.goto('/blog/deck-kayu-balkon-apartemen');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Deck Kayu untuk Balkon Apartemen');
  await expect(page.locator('script[type="application/ld+json"]')).toContainText('BlogPosting');
});

test('robots, llms guide, and sitemap are publicly available', async ({ request }) => {
  const [robots, llms, sitemap] = await Promise.all([
    request.get('/robots.txt'),
    request.get('/llms.txt'),
    request.get('/sitemap-index.xml'),
  ]);
  await expect(robots).toBeOK();
  await expect(llms).toBeOK();
  await expect(sitemap).toBeOK();
  await expect(robots.text()).resolves.toContain('OAI-SearchBot');
  await expect(llms.text()).resolves.toContain('Deck balkon Apartemen Dharmawangsa');
});
