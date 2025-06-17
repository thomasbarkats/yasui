import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "YasuiJS",
  description: "An other lightweight REST API framework",
  lastUpdated: true,
  
  themeConfig: {
    logo: '/logo.png',
    
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
      { text: 'Guide', link: '/getting-started' },
      { text: 'API Reference', link: '/decorators' },
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
        text: 'Core Features',
        items: [
          { text: 'Decorators', link: '/decorators' },
          { text: 'Dependency Injection', link: '/dependency-injection' },
          { text: 'Middleware', link: '/middleware' },
          { text: 'Configuration', link: '/configuration' },
          { text: 'Error Handling', link: '/error-handling' }
        ]
      }
    ],
  },

  locales: {
    root: {
      label: 'English',
      lang: 'en',
    }
  }
})
