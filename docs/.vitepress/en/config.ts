import { defineConfig } from 'vitepress'

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
      { text: 'Guide', link: '/guide/what-is-yasuijs' },
      { text: 'Reference', link: '/reference/decorators' },
      { text: 'Team', link: '/team' },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/thomasbarkats/yasui' }
    ],

    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'What is YasuiJS?', link: '/guide/what-is-yasuijs' },
          { text: 'Quick Start', link: '/guide/getting-started' },
          { text: 'Basic Concepts', link: '/guide/basic-concepts' }
        ]
      },
      {
        text: 'Reference',
        items: [
          { text: 'Decorators', link: '/reference/decorators' },
          { text: 'Dependency Injection', link: '/reference/dependency-injection' },
          { text: 'Middleware', link: '/reference/middleware' },
          { text: 'Configuration', link: '/reference/configuration' },
          { text: 'Error Handling', link: '/reference/error-handling' }
        ]
      }
    ]
  }
}) 