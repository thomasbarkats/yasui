export default {
  title: 'YasuiJS',
  description: 'Ship production-ready REST APIs in minutes',
  themeConfig: {
    footer: {
      message: 'Released under the AGPL v3 License.',
      copyright: 'Copyright © 2021-present Thomas BARKATS',
    },
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/what-is-yasuijs' },
      { text: 'Reference', link: '/reference/config' },
      { text: 'Plugins', link: '/plugins/cors' }
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
          { text: 'What is YasuiJS?', link: '/guide/what-is-yasuijs' },
          { text: 'Getting Started', link: '/guide/getting-started' },
          { text: 'Basic Concepts', link: '/guide/basic-concepts' },
          { text: 'Comparisons', link: '/guide/comparisons' },
          { text: 'Migration v4.x', link: '/guide/migration-v4' }
        ]
      },
      {
        text: 'Reference',
        items: [
          { text: 'Configuration', link: '/reference/config' },
          { text: 'Controllers', link: '/reference/controllers' },
          { text: 'Middlewares', link: '/reference/middlewares' },
          { text: 'Pipes', link: '/reference/pipes' },
          { text: 'Dependency Injection', link: '/reference/dependency-injection' },
          { text: 'Error Handling', link: '/reference/error-handling' },
          { text: 'Logging', link: '/reference/logging' },
          { text: 'Swagger Doc.', link: '/reference/swagger' }
        ]
      },
      {
        text: 'Plugins',
        items: [
          { text: 'CORS', link: '/plugins/cors' },
          { text: 'Rate Limiting', link: '/plugins/rate-limit' },
          { text: 'Validation', link: '/plugins/validation' }
        ]
      }
    ]
  }
};
