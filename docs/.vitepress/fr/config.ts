import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "YasuiJS",
  description: "Un framework REST API léger",
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
      message: 'Publié sous licence AGPL.',
      copyright: 'Copyright © 2021-present Thomas Barkats'
    },

    nav: [
      { text: 'Accueil', link: '/fr/' },
      { text: 'Guide', link: '/fr/guide/getting-started' },
      { text: 'Référence', link: '/fr/reference/decorators' },
      { text: 'Équipe', link: '/fr/team' },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/thomasbarkats/yasui' }
    ],

    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Qu\'est-ce que YasuiJS ?', link: '/fr/reference/what-is-yasuijs' },
          { text: 'Démarrage rapide', link: '/fr/guide/getting-started' },
          { text: 'Concepts de base', link: '/fr/guide/basic-concepts' }
        ]
      },
      {
        text: 'Référence',
        items: [
          { text: 'Décorateurs', link: '/fr/reference/decorators' },
          { text: 'Injection de dépendances', link: '/fr/reference/dependency-injection' },
          { text: 'Middlewares', link: '/fr/reference/middleware' },
          { text: 'Configuration', link: '/fr/reference/configuration' },
          { text: 'Gestion d\'erreurs', link: '/fr/reference/error-handling' }
        ]
      }
    ]
  }
}) 