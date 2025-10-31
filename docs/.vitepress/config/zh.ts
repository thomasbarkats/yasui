export default {
  title: 'YasuiJS',
  description: '几分钟内发布生产就绪的REST API',
  themeConfig: {
    footer: {
      message: '根据AGPL v3许可证发布。',
      copyright: '版权 © 2021-至今 Thomas BARKATS',
    },
    nav: [
      { text: '首页', link: '/zh/' },
      { text: '指南', link: '/zh/guide/what-is-yasuijs' },
      { text: '参考', link: '/zh/reference/config' }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/thomasbarkats/yasui' },
      { icon: 'npm', link: 'https://npmjs.com/package/yasui' },
      { icon: 'jsr', link: 'https://jsr.io/@yasui/yasui' }
    ],
    sidebar: [
      {
        text: '指南',
        items: [
          { text: '什么是YasuiJS？', link: '/zh/guide/what-is-yasuijs' },
          { text: '快速开始', link: '/zh/guide/getting-started' },
          { text: '基本概念', link: '/zh/guide/basic-concepts' },
          { text: '比较', link: '/zh/guide/comparisons' },
          { text: '迁移 v4.x', link: '/zh/guide/migration-v4' }
        ]
      },
      {
        text: '参考',
        items: [
          { text: '配置', link: '/zh/reference/config' },
          { text: '控制器', link: '/zh/reference/controllers' },
          { text: '中间件', link: '/zh/reference/middlewares' },
          { text: '管道', link: '/zh/reference/pipes' },
          { text: '依赖注入', link: '/zh/reference/dependency-injection' },
          { text: '错误处理', link: '/zh/reference/error-handling' },
          { text: '日志', link: '/zh/reference/logging' },
          { text: 'Swagger 文档', link: '/zh/reference/swagger' }
        ]
      }
    ]
  }
};
