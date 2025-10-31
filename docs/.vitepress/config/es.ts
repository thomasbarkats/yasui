export default {
  title: 'YasuiJS',
  description: 'Envía APIs REST listas para producción en minutos',
  themeConfig: {
    footer: {
      message: 'Publicado bajo la Licencia AGPL v3.',
      copyright: 'Copyright © 2021-presente Thomas BARKATS',
    },
    nav: [
      { text: 'Inicio', link: '/es/' },
      { text: 'Guía', link: '/es/guide/what-is-yasuijs' },
      { text: 'Referencia', link: '/es/reference/config' }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/thomasbarkats/yasui' },
      { icon: 'npm', link: 'https://npmjs.com/package/yasui' },
      { icon: 'jsr', link: 'https://jsr.io/@yasui/yasui' }
    ],
    sidebar: [
      {
        text: 'Guía',
        items: [
          { text: '¿Qué es YasuiJS?', link: '/es/guide/what-is-yasuijs' },
          { text: 'Primeros Pasos', link: '/es/guide/getting-started' },
          { text: 'Conceptos Básicos', link: '/es/guide/basic-concepts' },
          { text: 'Comparaciones', link: '/es/guide/comparisons' },
          { text: 'Migración v4.x', link: '/es/guide/migration-v4' }
        ]
      },
      {
        text: 'Referencia',
        items: [
          { text: 'Configuración', link: '/es/reference/config' },
          { text: 'Controladores', link: '/es/reference/controllers' },
          { text: 'Middlewares', link: '/es/reference/middlewares' },
          { text: 'Pipes', link: '/es/reference/pipes' },
          { text: 'Inyección de Dependencias', link: '/es/reference/dependency-injection' },
          { text: 'Manejo de Errores', link: '/es/reference/error-handling' },
          { text: 'Registro de Eventos', link: '/es/reference/logging' },
          { text: 'Swagger Doc.', link: '/es/reference/swagger' }
        ]
      }
    ]
  }
};
