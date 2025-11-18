import { test, expect } from '@playwright/test';

test('homepage has Serasi Parket in title and body', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Serasi Parket/);
  await expect(page.locator('body')).toContainText('Serasi Parket');
  await page.screenshot({ path: '/home/jules/verification/homepage.png', fullPage: true });
});

test('blog index page works', async ({ page }) => {
    await page.goto('/blog');
    await expect(page.locator('h1')).toContainText('Blog');
    await page.screenshot({ path: '/home/jules/verification/blog-index.png', fullPage: true });
});

test('first blog post page works', async ({ page }) => {
    await page.goto('/blog/memilih-kayu-berkualitas');
    await expect(page.locator('h1')).toContainText('5 Tips Memilih Kayu Berkualitas untuk Proyek Anda');
    await page.screenshot({ path: '/home/jules/verification/blog-post.png', fullPage: true });
});
