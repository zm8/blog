import type { DefaultTheme, HeadConfig } from 'vitepress';
import { generateStructure } from './generateStructure.mjs';

export default {
  base: '/blog/',
  title: 'David.Zheng Blog',
  description: 'A Front-End Developer',
  head: head(),
  srcDir: 'src',
  themeConfig: {
    sidebarMenuLabel: '菜单',
    siteTitle: 'Ming.Zheng Blog',
    darkModeSwitchLabel: '主题',
    darkModeSwitchTitle: '切换到深色模式',
    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/zm8/blog',
      },
    ],
    docFooter: {
      next: '下一页',
      prev: '上一页',
    },
    footer: {
      copyright: `Copyright © 2014-${new Date().getFullYear()}`,
    },
    lastUpdated: {
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium',
      },
      text: '最后更新于',
    },
    lightModeSwitchTitle: '切换到浅色模式',
    logo: '/images/vite.svg',
    outline: {
      label: '页面导航',
    },
    returnToTopLabel: '回到顶部',
    search: {
      options: {
        locales: {
          zh: {
            translations: {
              button: {
                buttonAriaLabel: '搜索文档',
                buttonText: '搜索文档',
              },
              modal: {
                footer: {
                  navigateText: '切换',
                  selectText: '选择',
                },
                noResultsText: '无法找到相关结果',
                resetButtonTitle: '清除查询条件',
              },
            },
          },
        },
      },
      provider: 'local',
    },
    sidebar: {
      '/pages/': { base: '/pages/', items: sidebarPages() },
    },
  },
  vite: {
    server: {
      host: true,
      port: 6173,
    },
  },
};

function sidebarPages(): DefaultTheme.SidebarItem[] {
  return generateStructure();
}

function head(): HeadConfig[] {
  return [
    [
      'meta',
      {
        content: 'vue3, react, vitejs, vite, shacdn-ui',
        name: 'keywords',
      },
    ],
    ['link', { href: '/blog/logo.svg', rel: 'icon', type: 'image/svg+xml' }],
    [
      'meta',
      {
        content:
          'width=device-width,initial-scale=1,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no',
        name: 'viewport',
      },
    ],
    ['meta', { content: 'David blog docs', name: 'keywords' }],
    ['link', { href: '/favicon.ico', rel: 'icon' }],
  ];
}
