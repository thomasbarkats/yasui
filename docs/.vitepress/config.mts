import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "YasuiJS",
  description: "An other lightweight REST API framework",
  lastUpdated: true,
  head: [['link', { rel: 'icon', href: '/favicon.ico' }]],
  
  themeConfig: {
    search: {
      provider: 'local'
    },

    editLink: {
      pattern: 'https://github.com/thomasbarkats/yasui/edit/main/docs/:path'
    },

    footer: {
      message: 'Released under the AGPL License.',
      copyright: 'Copyright © 2021-present Thomas Barkats'
    },

    nav: [
      { text: 'Home', link: '/' },
      { text: 'Docs', link: '/what-is-yasuijs' },
      { text: 'Team', link: '/team' },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/thomasbarkats/yasui' }
    ],

    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'What is YasuiJS?', link: '/what-is-yasuijs' },
          { text: 'Quick Start', link: '/getting-started' },
          { text: 'Basic Concepts', link: '/basic-concepts' }
        ]
      },
      {
        text: 'Reference',
        items: [
          { text: 'Decorators', link: '/decorators' },
          { text: 'Dependency Injection', link: '/dependency-injection' },
          { text: 'Middleware', link: '/middleware' },
          { text: 'Configuration', link: '/configuration' },
          { text: 'Error Handling', link: '/error-handling' }
        ]
      },
    ],
  },

  locales: {
    root: {
      label: 'English',
      lang: 'en',
    }
  }
})
