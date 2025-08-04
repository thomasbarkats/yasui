export default {
  title: 'YasuiJS',
  description: 'Envía APIs REST listas para producción en minutos',
  themeConfig: {
    footer: {
      message: 'Publicado bajo la Licencia AGPL v3.',
    },
    nav: [
      { text: 'Inicio', link: '/es/' },
      { text: 'Guía', link: '/es/guide/what-is-yasuijs' },
      { text: 'Referencia', link: '/es/reference/config' },
      { text: 'Equipo', link: '/es/team' },
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/thomasbarkats/yasui' },
      { icon: 'npm', link: 'http://npmjs.com/package/yasui' }
    ],
    sidebar: [
      {
        text: 'Guía',
        items: [
          { text: '¿Qué es YasuiJS?', link: '/es/guide/what-is-yasuijs' },
          { text: 'Primeros Pasos', link: '/es/guide/getting-started' },
          { text: 'Conceptos Básicos', link: '/es/guide/basic-concepts' }
        ]
      },
      {
        text: 'Referencia',
        items: [
          { text: 'Configuración', link: '/es/reference/config' },
          { text: 'Controladores', link: '/es/reference/controllers' },
          { text: 'Middlewares', link: '/es/reference/middlewares' },
          { text: 'Inyección de Dependencias', link: '/es/reference/dependency-injection' },
          { text: 'Registro de Eventos', link: '/es/reference/logging' },
          { text: 'Manejo de Errores', link: '/es/reference/error-handling' },
          { text: 'Swagger Doc.', link: '/es/reference/swagger' }
        ]
      }
    ]
  }
};
