import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel/static';
import partytown from '@astrojs/partytown';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.jasakayuprofesional.com',
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
  },
  image: {
    domains: ['picsum.photos', 'images.unsplash.com']
  }
});