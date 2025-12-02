import { defineConfig } from 'vitepress'
import enConfig from './config/en'
import frConfig from './config/fr';
import esConfig from './config/es';
import zhConfig from './config/zh';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "YasuiJS",
  lastUpdated: true,
  head: [
    ['link', { rel: 'dns-prefetch', href: '//raw.githubusercontent.com' }],
    ['link', { rel: 'preconnect', href: 'https://raw.githubusercontent.com' }],
    ['link', {
      rel: 'icon',
      href: 'https://raw.githubusercontent.com/thomasbarkats/assets/refs/heads/main/yasui/yasui-logo-mascot.ico'
    }],
    ['link', {
      rel: 'preload',
      href: 'https://raw.githubusercontent.com/thomasbarkats/assets/refs/heads/main/yasui/yasui-logo-mascot-opt.svg',
      as: 'image',
      type: 'image/svg+xml',
      fetchpriority: 'high'
    }],
    ['link', {
      rel: 'preload',
      href: '/theme/fonts/YasuiCofeben.ttf',
      as: 'font',
      type: 'font/ttf',
      crossorigin: 'anonymous'
    }],
  ],
  rewrites: {
    'en/(.*)': '(.*)'
  },
  themeConfig: {
    search: {
      provider: 'local'
    },
    editLink: {
      pattern: 'https://github.com/thomasbarkats/yasui/edit/main/docs/:path'
    },
  },
  locales: {
    root: {
      label: 'English',
      lang: 'en',
      ...enConfig
    },
    fr: {
      label: 'Français',
      lang: 'fr',
      ...frConfig
    },
    es: {
      label: 'Spanish',
      lang: 'es',
      ...esConfig
    },
    zh: {
      label: '简体中文',
      lang: 'zh',
      ...zhConfig
    }
  }
});
