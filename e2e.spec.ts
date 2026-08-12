import { test, expect } from '@playwright/test';

test('homepage keeps the focused studio story, real logo, and conversion path', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Jasa Kayu Profesional/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/Ruang yang terasa\s*hidup/);
  await expect(page.locator('header img[src="/icons/wmremove-transformed.ico"]')).toBeVisible();
  await expect(page.locator('#layanan')).toBeVisible();
  await expect(page.locator('#portofolio')).toBeVisible();
  await expect(page.locator('#portofolio').getByText('Pilihan karya')).toBeVisible();
  await expect(page.getByText('Field notes', { exact: true })).toBeVisible();
  await expect(page.locator('#kontak')).toBeVisible();
  await expect(page.getByRole('button', { name: /Buka brief di WhatsApp/i })).toBeVisible();
});

test('mobile navigation opens cleanly and routes to gallery', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const toggle = page.locator('#mobile-menu-toggle');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await toggle.click();
  const nav = page.getByRole('navigation', { name: 'Navigasi mobile' });
  await expect(nav).toBeVisible();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(toggle).toHaveAttribute('aria-label', 'Tutup navigasi');
  await page.getByRole('link', { name: /Galeri/i }).last().click();
  await expect(page).toHaveURL(/\/galeri/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Material menjadi berarti');
});

test('gallery filtering and project dossier navigation work', async ({ page }) => {
  await page.goto('/galeri');
  const filterTabs = page.getByRole('tab');
  await expect(filterTabs.first()).toHaveText(/Semua/i);
  const count = await filterTabs.count();
  if (count > 1) {
    const second = filterTabs.nth(1);
    const label = await second.textContent();
    await second.click();
    await expect(second).toHaveAttribute('aria-selected', 'true');
    expect(label?.trim().length).toBeGreaterThan(0);
  }
  const firstProject = page.locator('.gallery-item a').first();
  await expect(firstProject).toBeVisible();
  await firstProject.click();
  await expect(page).toHaveURL(/\/portfolio\//);
  await expect(page.getByText('Project facts')).toBeVisible();
  await expect(page.getByText('Karya terkait')).toBeVisible();
});

test('premium service pages render their specialized systems', async ({ page }) => {
  await page.goto('/layanan/lantai-kayu-premium');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Lantai kayu yang mengikuti ruang');
  await expect(page.getByText('Solid vs engineered')).toBeVisible();
  await expect(page.getByText('Urutan kerja')).toBeVisible();

  await page.goto('/layanan/pergola-decking-outdoor');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Kayu di luar ruang');
  await expect(page.getByText('Weather logic')).toBeVisible();

  await page.goto('/layanan/jasa-kayu-tangsel');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('konteks Tangsel');
  await expect(page.getByText('Local proof')).toBeVisible();
  await expect(page.getByRole('link', { name: /Lihat project dossier/i })).toBeVisible();
});

test('deck ulin specialist landing stays focused and mobile usable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/deck-ulin');
  await expect(page).toHaveTitle(/Deck Ulin/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/Fokus satu hal:\s*deck ulin/i);
  await expect(page.getByRole('navigation', { name: 'Navigasi Deck Ulin' })).toBeHidden();
  await expect(page.getByText('Project proof')).toBeVisible();
  await expect(page.locator('#sistem').getByText('Sistem deck', { exact: true })).toBeVisible();
  await expect(page.locator('#hero').getByRole('link', { name: /Konsultasi deck ulin/i })).toBeVisible();
  await expect(page.locator('script[type="application/ld+json"]')).not.toHaveCount(0);
});

test('journal hub and article remain crawlable', async ({ page }) => {
  await page.goto('/blog');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Catatan untuk mengambil keputusan');
  const firstArticle = page.locator('article a[href^="/blog/"]').first();
  await expect(firstArticle).toBeVisible();
  const href = await firstArticle.getAttribute('href');
  expect(href).toBeTruthy();
  await firstArticle.click();
  await expect(page).toHaveURL(/\/blog\//);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('script[type="application/ld+json"]')).not.toHaveCount(0);
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
  await expect(llms.text()).resolves.toContain('Jasa Kayu Profesional');
});
