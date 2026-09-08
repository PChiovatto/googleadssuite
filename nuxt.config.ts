// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss'
  ],
  css: [
    '~/assets/css/main.css'
  ],
  nitro: {
    externals: {
      inline: [],
      trace: false
    }
  },
  runtimeConfig: {
    // Private keys available only on the server
    databaseUrl: process.env.DATABASE_URL || 'file:./dev.db',
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    googleAdsClientId: process.env.GOOGLE_ADS_CLIENT_ID || '',
    googleAdsClientSecret: process.env.GOOGLE_ADS_CLIENT_SECRET || '',
    googleAdsDeveloperToken: process.env.GOOGLE_ADS_DEVELOPER_TOKEN || '',
    googleAdsRefreshToken: process.env.GOOGLE_ADS_REFRESH_TOKEN || '',
    googleAdsLoginCustomerId: process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID || '',
    googleAdsCustomerId: process.env.GOOGLE_ADS_CUSTOMER_ID || '',
    authSecret: process.env.AUTH_SECRET || 'dev_secret_key',

    // Public keys exposed to the client
    public: {
      appName: "Tony's Painting & Remodeling - Omni-Agent Suite",
      apiVersion: 'v1.0'
    }
  },
  app: {
    head: {
      title: "Tony's Painting and Remodeling - Omni-Agent CRM & PWA Workspace",
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: "Tony's Painting and Remodeling - CRM Omni-Agent com IA Gemini, discador Twilio, contratos MA HIC e Webmail corporativo." }
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/tonys_favicon.png' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap' }
      ]
    }
  }
})
