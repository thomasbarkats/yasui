export default {
  title: 'YasuiJS',
  description: 'Ship production-ready REST APIs in minutes',
  themeConfig: {
    footer: {
      message: 'Released under the AGPL v3 License.',
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
          { text: 'Getting Started', link: '/guide/getting-started' },
          { text: 'Basic Concepts', link: '/guide/basic-concepts' }
        ]
      },
      {
        text: 'Reference',
        items: [
          { text: 'Configuration', link: '/reference/config' },
          { text: 'Controllers', link: '/reference/controllers' },
          { text: 'Middlewares', link: '/reference/middlewares' },
          { text: 'Dependency Injection', link: '/reference/dependency-injection' },
          { text: 'Logging', link: '/reference/logging' },
          { text: 'Error Handling', link: '/reference/error-handling' },
          { text: 'Swagger', link: '/reference/swagger' }
        ]
      }
    ]
  }
};
