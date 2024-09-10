import type { DefaultTheme, HeadConfig } from 'vitepress'

export default {
  base: '/blog/',
  title: 'Ming Blog',
  description: 'A Front-End Developer',
  head: head(),
  srcDir: 'src',
  themeConfig: {
    darkModeSwitchLabel: '主题',
    darkModeSwitchTitle: '切换到深色模式',
    docFooter: {
      next: '下一页',
      prev: '上一页'
    },
    footer: {
      copyright: `Copyright © 2014-${new Date().getFullYear()}`
    },
    lastUpdated: {
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium'
      },
      text: '最后更新于'
    },
    lightModeSwitchTitle: '切换到浅色模式',
    logo: '/images/vite.svg',
    nav: nav(),
    outline: {
      label: '页面导航'
    },
    returnToTopLabel: '回到顶部',
    search: {
      options: {
        locales: {
          zh: {
            translations: {
              button: {
                buttonAriaLabel: '搜索文档',
                buttonText: '搜索文档'
              },
              modal: {
                footer: {
                  navigateText: '切换',
                  selectText: '选择'
                },
                noResultsText: '无法找到相关结果',
                resetButtonTitle: '清除查询条件'
              }
            }
          }
        }
      },
      provider: 'local'
    },
    sidebar: {
      '/pages/': { base: '/pages/', items: sidebarPages() }
    },
    sidebarMenuLabel: '菜单',
    siteTitle: 'Ming Blog'
  },
  vite: {
    build: {
      chunkSizeWarningLimit: Infinity,
      minify: 'terser'
    },
    json: {
      stringify: true
    },
    server: {
      host: true,
      port: 6173
    }
  }
}

function nav(): DefaultTheme.NavItem[] {
  return [
    {
      link: 'https://cn.vuejs.org/',
      text: 'Vue'
    },
    {
      link: 'https://react.dev/',
      text: 'React'
    },
    {
      text: '常用链接',
      items: [
        {
          link: 'https://chatgpt.com/',
          text: 'ChatGpt'
        },
        {
          link: 'https://github.com/',
          text: 'Github'
        }
      ]
    }
  ]
}

function sidebarPages(): DefaultTheme.SidebarItem[] {
  return [
    {
      collapsed: false,
      text: 'Vue',
      items: [
        {
          link: 'yyyy',
          text: 'xxxx'
        }
      ]
    },
    {
      collapsed: false,
      text: 'React',
      items: [
        {
          link: 'react/react-fiber',
          text: 'React Fiber 学习'
        }
      ]
    },
    {
      collapsed: false,
      text: 'Typescript',
      items: [
        {
          link: 'typescript/typescript-guide',
          text: 'Typescript 进阶指南'
        }
      ]
    },
    {
      collapsed: false,
      text: 'Algorithm',
      items: [
        {
          link: 'algorithm/array-deduplication',
          text: '数组去重'
        },
        {
          link: 'algorithm/hanoi-tower',
          text: '汉诺塔问题'
        },
        {
          link: 'algorithm/js-string-template',
          text: 'Javascript 字符串模板'
        },
        {
          link: 'algorithm/leetcode-algorithm',
          text: 'Leetcode 算法题'
        }
      ]
    },
    {
      collapsed: false,
      text: 'CSS',
      items: [
        {
          link: 'css/css-center',
          text: 'CSS 元素居中'
        },
        {
          link: 'css/css-grid-width-allocation',
          text: 'Grid 中元素的实际宽度问题'
        },
        {
          link: 'css/css-notes',
          text: 'CSS 知识点记录'
        },
        {
          link: 'css/css-selector',
          text: 'CSS 选择器'
        },
        {
          link: 'css/flex-basic-learn',
          text: 'Flex 基础学习'
        },
        {
          link: 'css/flex-notes',
          text: 'Flex 知识点记录'
        },
        {
          link: 'css/scss-learn',
          text: 'SCSS 学习'
        }
      ]
    },
    {
      collapsed: false,
      text: 'Node.js',
      items: [
        {
          link: 'nodejs/eggjs-logging',
          text: 'Eggjs的日志功能'
        },
        {
          link: 'nodejs/http-get-serve',
          text: 'Node.js处理GET请求的HTTP服务器'
        },
        {
          link: 'nodejs/http-post-form',
          text: 'Node.js处理表单提交的POST请求'
        },
        {
          link: 'nodejs/http-post-serve',
          text: 'Node.js创建POST请求的HTTP服务器'
        },
        {
          link: 'nodejs/nodejs-path-difference',
          text: 'Node.js里的__dirname, __filename, process.cwd(), path.resolve()区别'
        },
        {
          link: 'nodejs/path-join-vs-resolve',
          text: 'path.join和path.resolve的区别'
        }
      ]
    }
  ]
}

function head(): HeadConfig[] {
  return [
    [
      'meta',
      {
        content: 'vue3, react, vitejs, vite, shacdn-ui',
        name: 'keywords'
      }
    ],
    ['link', { href: '/logo.svg', rel: 'icon', type: 'image/svg+xml' }],
    [
      'meta',
      {
        content:
          'width=device-width,initial-scale=1,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no',
        name: 'viewport'
      }
    ],
    ['meta', { content: 'David blog docs', name: 'keywords' }],
    ['link', { href: '/favicon.ico', rel: 'icon' }]
  ]
}
