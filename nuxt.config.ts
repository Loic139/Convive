export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/supabase',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/i18n',
  ],

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      title: 'Convive — Organisez vos repas entre amis',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Invitez vos amis à table, gérez les places facilement.' },
        { property: 'og:title', content: 'Convive' },
        { property: 'og:description', content: 'Invitez vos amis à table, gérez les places facilement.' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
        },
      ],
    },
  },

  supabase: {
    redirect: false,
  },

  i18n: {
    locales: [
      { code: 'fr', file: 'fr.json', name: 'Français' },
      { code: 'en', file: 'en.json', name: 'English' },
    ],
    defaultLocale: 'fr',
    langDir: 'locales/',
    strategy: 'no_prefix',
  },

  runtimeConfig: {
    supabaseServiceKey: '',
    resendApiKey: '',
    resendFromEmail: 'noreply@convive.app',
    resendFromName: 'Convive',
    cronSecret: '',
    public: {
      appUrl: 'http://localhost:3000',
    },
  },

  typescript: {
    strict: true,
  },

  compatibilityDate: '2024-11-01',
})
