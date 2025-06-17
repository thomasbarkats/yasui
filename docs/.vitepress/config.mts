import { defineConfig } from 'vitepress'
import enConfig from './en/config'
import frConfig from './fr/config'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "YasuiJS",
  lastUpdated: true,
  head: [['link', { rel: 'icon', href: '/favicon.ico' }]],

  themeConfig: {
    search: {
      provider: 'local'
    },

    editLink: {
      pattern: 'https://github.com/thomasbarkats/yasui/edit/main/docs/:path'
    },
  },

  locales: {
    root: {
      label: 'English',
      lang: 'en',
      ...enConfig
    },
    fr: {
      label: 'French',
      lang: 'fr',
      link: '/fr/',
      ...frConfig
    }
  }
})
