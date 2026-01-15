// analytics.config.ts
export const ANALYTICS_CONFIG = {
  ga4: {
    measurementId: 'G-DEHKJSEDYC', // ID yang sudah digunakan di project
  },
  tracking: {
    pageView: true,
    events: true,
    enhancedEcommerce: false,
  },
  consent: {
    required: false, // Untuk pasar Indonesia, bisa disesuaikan dengan kebijakan privasi
  }
};