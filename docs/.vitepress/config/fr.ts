export default {
  title: 'YasuiJS',
  description: 'Déployez des API REST prêtes pour la production en quelques minutes',
  themeConfig: { 
    footer: {
      message: 'Publié sous la licence AGPL v3.',
      copyright: 'Copyright © 2021-présent Thomas BARKATS',
    },
    nav: [
      { text: 'Accueil', link: '/fr/' },
      { text: 'Guide', link: '/fr/guide/what-is-yasuijs' },
      { text: 'Référence', link: '/fr/reference/config' },
      { text: 'Plugins', link: '/fr/plugins/cors' }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/thomasbarkats/yasui' },
      { icon: 'buymeacoffee', link: 'https://buymeacoffee.com/thomasbrkts' },
      { icon: 'npm', link: 'https://npmjs.com/package/yasui' },
      { icon: 'jsr', link: 'https://jsr.io/@yasui/yasui' }
    ],
    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Qu\'est-ce que YasuiJS ?', link: '/fr/guide/what-is-yasuijs' },
          { text: 'Démarrage', link: '/fr/guide/getting-started' },
          { text: 'Concepts de base', link: '/fr/guide/basic-concepts' },
          { text: 'Comparaisons', link: '/fr/guide/comparisons' },
          { text: 'Migration v4.x', link: '/fr/guide/migration-v4' }
        ]
      },
      {
        text: 'Référence',
        items: [
          { text: 'Configuration', link: '/fr/reference/config' },
          { text: 'Contrôleurs', link: '/fr/reference/controllers' },
          { text: 'Middlewares', link: '/fr/reference/middlewares' },
          { text: 'Pipes', link: '/fr/reference/pipes' },
          { text: 'Injection de dépendances', link: '/fr/reference/dependency-injection' },
          { text: 'Gestion des erreurs', link: '/fr/reference/error-handling' },
          { text: 'Journalisation', link: '/fr/reference/logging' },
          { text: 'Swagger Doc.', link: '/fr/reference/swagger' }
        ]
      },
      {
        text: 'Plugins',
        items: [
          { text: 'CORS', link: '/fr/plugins/cors' }
        ]
      }
    ]
  }
};
