// https://nuxt.com/docs/api/configuration/nuxt-config
const isGithubPages = process.env.GITHUB_PAGES === 'true'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: true,
  modules: ['@wagmi/vue/nuxt'],
  vite: {
    resolve: {
      alias: {
        eventemitter3: new URL('node_modules/eventemitter3/index.js', import.meta.url).pathname,
      },
    },
  },
  nitro: {
    preset: 'static',
    prerender: {
      routes: ['/'],
      crawlLinks: true,
    },
  },
  app: {
    baseURL: isGithubPages ? '/nuxt-wagmi-eip7702/' : '/',
    head: {
      title: 'EIP-7702 Delegation Manager',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
    },
  },
})
