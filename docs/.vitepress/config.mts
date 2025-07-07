import { defineConfig } from 'vitepress'
import enConfig from './config/en'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "YasuiJS",
  lastUpdated: true,
  head: [['link', { rel: 'icon', href: 'https://raw.githubusercontent.com/thomasbarkats/assets/refs/heads/main/yasui/yasui-logo-mascot.png' }]],
  rewrites: {
    'en/(.*)': '(.*)'
  },
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
    }
  }
});
