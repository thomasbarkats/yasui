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
      { text: 'Équipe', link: '/fr/team' },
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/thomasbarkats/yasui' },
      { icon: 'npm', link: 'http://npmjs.com/package/yasui' }
    ],
    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Qu\'est-ce que YasuiJS ?', link: '/fr/guide/what-is-yasuijs' },
          { text: 'Démarrage', link: '/fr/guide/getting-started' },
          { text: 'Concepts de base', link: '/fr/guide/basic-concepts' }
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
      }
    ]
  }
};
