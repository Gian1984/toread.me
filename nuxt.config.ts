import { pages, pageRoutes, SITE_URL } from './utils/pagesRegistry'

export default defineNuxtConfig({
  compatibilityDate: '2026-04-25',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/sitemap'],
  css: ['~/assets/css/tailwind.css'],
  site: {
    url: SITE_URL,
    name: 'toread.me',
  },
  nitro: {
    preset: 'static',
    prerender: {
      routes: pageRoutes,
    },
  },
  app: {
    head: {
      htmlAttrs: {
        lang: 'en',
      },
      link: [
        { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
        { rel: 'icon', type: 'image/png', href: '/favicon.png' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      ],
    },
  },
  sitemap: {
    sitemapName: 'sitemap.xml',
    urls: Object.values(pages).map((page) => ({
      loc: page.path,
      priority: page.sitemap.priority,
      changefreq: page.sitemap.changefreq,
      lastmod: new Date().toISOString(),
    })),
  },
})
