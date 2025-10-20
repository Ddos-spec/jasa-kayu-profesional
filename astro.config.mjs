import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel/static';
import sitemap from '@astrojs/sitemap';
import partytown from '@astrojs/partytown';

export default defineConfig({
  site: 'https://jasa-kayu-profesional.vercel.app',
  output: 'static',
  adapter: vercel({
    webAnalytics: { enabled: true },
    speedInsights: { enabled: true }
  }),
  integrations: [
    tailwind(),
    sitemap(),
    partytown({
      config: {
        forward: ['gtag']
      }
    })
  ],
  vite: {
    optimizeDeps: {
      include: ['@astrojs/tailwind']
    }
  }
});