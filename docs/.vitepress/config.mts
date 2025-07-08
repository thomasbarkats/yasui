import { defineConfig } from 'vitepress'
import enConfig from './config/en'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "YasuiJS",
  lastUpdated: true,
  head: [
    ['link', { rel: 'dns-prefetch', href: '//raw.githubusercontent.com' }],
    ['link', { rel: 'preconnect', href: 'https://raw.githubusercontent.com' }],
    ['link', { 
      rel: 'icon', 
      href: 'https://raw.githubusercontent.com/thomasbarkats/assets/refs/heads/main/yasui/yasui-logo-mascot.png' 
    }],
    ['link', { 
      rel: 'preload', 
      href: 'https://raw.githubusercontent.com/thomasbarkats/assets/refs/heads/main/yasui/yasui-logo-mascot.png', 
      as: 'image',
      fetchpriority: 'high'
    }],
    ['link', { 
      rel: 'preload', 
      href: 'https://www.github.com/thomasbarkats.png', 
      as: 'image',
      fetchpriority: 'low'
    }],
    ['link', { 
      rel: 'preload', 
      href: 'https://www.github.com/alexandre-hallaine.png', 
      as: 'image',
      fetchpriority: 'low'
    }]
  ],
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
