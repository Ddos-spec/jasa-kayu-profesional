import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import fs from 'fs';

async function runAudit() {
  const url = 'https://www.jasakayuprofesional.com';
  console.log(`🚀 Sedang melakukan audit Lighthouse untuk: ${url} ...`);
  
  const chrome = await chromeLauncher.launch({chromeFlags: ['--headless', '--no-sandbox']});
  const options = {
    logLevel: 'info',
    output: 'json',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    port: chrome.port,
    strategy: 'mobile'
  };

  const runnerResult = await lighthouse(url, options);
  
  const reportJson = JSON.parse(runnerResult.report);
  const categories = reportJson.categories;
  
  console.log('\n--- SKOR LIGHTHOUSE TERBARU ---');
  console.log(`Performance: ${Math.round(categories.performance.score * 100)}`);
  console.log(`Accessibility: ${Math.round(categories.accessibility.score * 100)}`);
  console.log(`Best Practices: ${Math.round(categories['best-practices'].score * 100)}`);
  console.log(`SEO: ${Math.round(categories.seo.score * 100)}`);
  
  // Detil kegagalan performa (Top 3 issue)
  console.log('\n--- AREA YANG PERLU DIPERBAIKI (TOP 3) ---');
  const audits = reportJson.audits;
  const metrics = [
    { id: 'largest-contentful-paint', label: 'LCP' },
    { id: 'total-blocking-time', label: 'TBT' },
    { id: 'cumulative-layout-shift', label: 'CLS' }
  ];
  
  metrics.forEach(m => {
    console.log(`${m.label}: ${audits[m.id].displayValue} (${audits[m.id].score * 100})`);
  });

  await chrome.kill();
}

runAudit().catch(err => {
  console.error('Audit gagal:', err);
  process.exit(1);
});
