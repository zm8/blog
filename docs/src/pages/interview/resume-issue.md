# 简历问题

## 1. 自我介绍

### 工作项目

面试官您好, 简单的介绍一下最近一次工作项目:

#### 星财富 H5 Hybird App

使用 Vue 开发 星财富，主要是用 rem 来做响应式布局。架构了 JSBridge 和 Native 通信。
JSBridge 简单理解就是向 JavaScript 中提供了可以调用 Native 方法的 api。
![image](https://github.com/zm8/blog_old/assets/32337542/91010ff4-5cf0-4dbe-99e3-274e4e617ce2)

- 1. 单纯的向 Native 发送信息
- 2. 调用 Native 方法，传递信息，并执行回调函数。
- 3. 监听 Native 事件。

其中第 2 点，由于传递的时候只能传递字符串，所以不能直接传递回调函数，
所以得传入一个自增的唯一的 ID，并且把回调函数传入到 Map 里，那么 Native 收到消息回调 JS 方法的时候，传回自增 ID，这样可以调用那个回调函数。

#### admin 后台

使用 Vue 开发 admin 后台，beforeEach 来进行路由拦截(1. 判断 localStorage 是否有 token 2. 把服务端的路由转换成 vue 的路由，判断路由是否有 name 属性，从而跳转到无权限的页面)，addRoutes 来添加动态子路由。
参考地址： https://juejin.cn/post/7250386282400596029?searchId=20231027140618E67D299193E407B25092#heading-8

#### 数据大屏

使用 rem 做适配，然后定义 Vue 指令 "chart-resize"，使用 npm 包 "element-resize-detector" 监听 echarts 的 dom 元素变化，触发 `chart.resize();`
参考地址: https://juejin.cn/post/7163932925955112996?searchId=2023110213310242B65CD183DDD7FD04E7#heading-9

```js
// directive.js
import * as ECharts from "echarts";
import elementResizeDetectorMaker from "element-resize-detector";
import Vue from "vue";
const HANDLER = "_vue_resize_handler";
function bind(el, binding) {
  el[HANDLER] = binding.value
    ? binding.value
    : () => {
        let chart = ECharts.getInstanceByDom(el);
        if (!chart) {
          return;
        }
        chart.resize();
      };
  // 监听绑定的div大小变化，更新 echarts 大小
  elementResizeDetectorMaker().listenTo(el, el[HANDLER]);
}
function unbind(el) {
  // window.removeEventListener("resize", el[HANDLER]);
  elementResizeDetectorMaker().removeListener(el, el[HANDLER]);
  delete el[HANDLER];
}
// 自定义指令：v-chart-resize 示例：v-chart-resize="fn"
Vue.directive("chart-resize", { bind, unbind });
```

### 角色

我在项目里的角色，除了日常的工作开发，还做了一些架构工作，比如架构 JSBridge 和 Native 进行通信，前端工程化, 开发了一些脚手架, npm 包, 规范 git 提交代码, 一些错误监控。还用了微前端 qiankun 架构了子应用, eggjs 作为 BFF 中间层转发。

## 理解 vue 和 react 的底层原理

Vue2 响应式特点是依赖收集，通过 `Object.defineProperty` 递归劫持 data 的所有属性。
通过 compiler 解析模版，通过 obserser 来劫持 data，然后通过 watcher 来链接 compiler 和 observer，通过观察者模式来通知更新。
Vue3 通过 Proxy 重构性能更好。不再一开始就递归，运行时才递归，用到才代理。
React 是单向数据流，并且数据不可变，需要通过 setState 来更新。
Vue 是响应式的，React 是手动 setState。Vue 对数据的更新粒度比较细，React 推崇函数式，没办法感知更新了多少，需要从 root 根节点来判断。

## 跨端开发 和 小程序怎么理解?

### 跨端开发

首先得益于虚拟 dom，根据虚拟 dom 可以解析成各种指令，然后通过 Native 引擎进行渲染操作。uni-app 是基于 weex 改进的原生渲染引擎

### 小程序

在渲染流程中，由 Native 打开一个 WebView 容器，WebView 就像浏览器一样，打开 WebView 对应的 URL 地址，然后进行请求资源、加载数据、绘制页面，最终页面呈现在我们眼前。

小程序采用双线程架构，分为逻辑层和渲染层。

- 首先也是 Native 打开一个 WebView 页面，渲染层加载 WXML 和 WXSS 编译后的文件。
- 逻辑层用于逻辑处理，比如触发网络请求、setData 更新等等。接下来是请求资源，请求到数据之后，数据先通过逻辑层传递给 Native，然后通过 Native 把数据传递给渲染层 WebView，再进行渲染。

优化:

1. 控制 setData 频率: 合并 setData 和 状态提升数据预处理。
2. 非渲染的数据不用 setData。
3. 渲染的任务分片，控制元素渲染的优先级。
4. 数据清洗，只渲染视图相关的数据。

## 性能优化

### 1. 体积优化

分离 node_modules，包的大小一些检测。

### 2. 网络传输优化

静态资源使用 CDN, 图片使用 base64
开启 gzip 压缩
http2
路由懒加载
合理的使用第三方的库，按需加载，减少打包体积。

### 3. 感知优化

骨架屏

### 4. 代码层面:

长列表性能优化(分片加载大数据) requestIdleCallback，虚拟滚动，图片懒加载，路由懒加载。

## 前端工程化

1. gitlab 来控制提交规范，比如 feat(新功能), fix(修复 bug), refactor(重构)
2. eslint 规范代码, prettier 格式化代码
3. 发布通用组件的 npm 包，使用 lerna 来管理提交规范。lerna 是优化管理多包依赖发布的工具。
4. 编写脚手架来建不同的模版，提高创建一些新项目的开发效率。
5. 架构封装了通用 JSBrige 函数来和 Native 进行交互。
6. 错误监控。按照项目拆分，按照时间拆分，根据不同 行和列，错误信息 生成唯一的错误的 key，然后去 sourcemap 里面匹配。

## 其它

### PC 端封装了什么组件

Modal 封装了一些弹层组件，路由的权限组件。
一些请求的公共 hook 的组件。
Echarts 公共渲染模式抽出。

### 解决开发过程中遇到的各类技术难点

1. 复星 k8s 线上部署发布项目的时候, 有极小概率用户访问资源会 404。原因是所有的资源都是异步部署的，入口的 main.js 会加载不同页面模块的 JS，但是那些 JS 还没部署上去。

2. 医生工作台音视频技术，我们有用到第三方腾讯的 SDK，但是他们的软件有极小概率会出现不稳定，就是我们这边接收不到用户发来的视频。最终解决的方案是使用长轮询的方式查看当前的医生连接视频的情况。

### 如何进行前端管理

1. 制定的前端开发规范。
2. 根据不同组员的能力，合理的分配任务，把每个人的潜力和价值最大化。
3. 鼓励知识创作，分享技术，共建技术文档系统。
4. 完善前端监控和告警系统，保持项目线上稳定运行，出现问题易于追踪。
5. 代码 code review，发现并解决潜在的问题，带领团队成员攻克难点并持续把控代码质量。

## 8.介绍之前的项目

### 1. App 要区分大字版和小字版

大字版和小字版的逻辑是一样的，所以会抽出逻辑到 hook，页面用 2 套，css 由于差别不大用一套。
用户修改完大小字版，会通知 native，然后 native 通知首页和个人中心页面。

### 2. 根据导航栏点击，滚动到不同的位置。页面滑动的时候，导航栏也会切换到不同的位置。

难点: 页面里有的图片是异步加载 或者 页面里样式交互，需要监听高度变化。特别是最后一屏有 3 块内容都集中的时候，点击 Tab 要注意触发滚动，又会选中最后一个 Tab。

解决方案: 内嵌使用 iframe: 100%宽度和高度, 如果页面高度发生变化，会触发 iframe 的 reszie 事件，重而重新计算。
点击 Tab 的时候，选中当前 Tab，并且设置变量，不根据页面的滚动去设置上面的 Tab。

### 3. 表单校验: 由于是给老人看的，所以业务逻辑有点复杂。

需求: 有 2 种表单

1. 每个表单出现错误的时候，其它的错误提示需要隐藏。
2. 有个表单组的概念，比如当前页面有 3 组紧急联系人名字和手机号码。 1)只要用户填对一组，其它组没有填也算校验通过。 2)填对一组，其它组填错了，则出现提示错误，但是提交也给通过，只是会有提示。

解决方案:
通过 zustand(祖斯坦)，来收集表单的校验规则，表单的状态 status 有 pending, error, success。

1. 当前 input 错误，则重置其它表单 status 为 pending。
2. 当前组的联系人使用同一个 group 来校验。

### 4. 新手引导

1. 使用一个元素防止点击, 通过设置 "position: absolute, width: 100%, height: 100%"。
2. 另外一个元素设置, box-shadow, 让其它地方出现阴影。

## 其它

### 理解 javascript 是单线程

javascript 是单线程，浏览器是多线程。
遇到 setTimeout 将它交给 定时器线程去执行，当定时器线程计时执行完之后，会将回调函数放入任务队列中！
等主线程处理完了自己的事情，才来执行任务中的任务队列。

### 封装的组件有哪些

1. layout 组件
   使用插槽来封装

2. button 组件

3. 图表组件

4. List 组件

5. Modal 组件二次封装

参考地址: https://juejin.cn/post/6844904159385223175

### less 和 scss 的区别

#### 相同点

都有变量，运算，继承，嵌套的功能。

#### 不同点

1. 声明和使用变量: LESS 用@符号，SCSS 用$符号表示
2. 变量插值: LESS 采用@{XXXX}的形式，SCSS 采用${XXXX}的形式
3. SCSS 可以使用 if{}else，for 循环等等，LESS 不支持
4. 应用外部 css 文件方式不同
   SCSS 应用的 css 文件名必须以‘\_’开头（下划线），文件名如果以下划线开头的话，sass 会认为改文件是一个应用文件，不会将它转成 css 文件

### [Nginx 配置跨域请求](https://segmentfault.com/a/1190000012550346)

```
location / {
    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS';
    add_header Access-Control-Allow-Headers 'Content-Type,Authorization';

    if ($request_method = 'OPTIONS') {
        return 204;
    }
}
```

### qiankun 父子应用如何通信

1. 通过 initGlobalState 来注册 MicroAppStateActions 实例用于通信。

- setGlobalState 来设置 globalState - 设置新的值
- onGlobalStateChange：注册 观察者 函数, 子应用的 props 里面自带这个属性
- offGlobalStateChange: 取消 观察者 函数, 子应用的 props 里面自带这个属性

参考地址: https://qiankun.umijs.org/zh/api#initglobalstatestate

2. 共享 shared
   通用主应用定义 redux 全局状态，然后传递给子应用的 props，当然子应用也要单独维护一套自己的全局状态的控制。
