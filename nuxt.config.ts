// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@nuxt/ui',
    '@nuxt/eslint',
    '@nuxt/content',
    'nuxt-auth-utils',
    'nuxt-authorization',
  ],
  css: ['~/assets/css/main.css'],
  auth: {
    hash: {
      scrypt: {
        // See https://github.com/adonisjs/hash/blob/94637029cd526783ac0a763ec581306d98db2036/src/types.ts#L144
      },
    },
  },
  content: {
    experimental: {
      sqliteConnector: 'native',
    },
  },
  nitro: {
    preset: 'cloudflare_module',
    cloudflare: {
      deployConfig: true,
      nodeCompat: true,
    }
  },
  // devServer: {
  //   host: '0.0.0.0', // écoute sur toutes les interfaces
  //   port: 3000,      // ou un autre port si tu veux
  // },

  typescript: {
    tsConfig: {
      compilerOptions: {
        types: ["@cloudflare/workers-types/2023-07-01"],
      },
    },
  },
  eslint: {
    config: {
      stylistic: true,
    },
  },
})