# Shadow DOM 学习

## 1. Shadow dom 是什么?

1.影子 DOM 树, 使用 JS API 将[影子 DOM 树] 附加到元素上, 与主文档的 DOM 树隔离;

2.在 Chrome 浏览器的 `Settings > Preferences > Elements > Show user agent shadow DOM` 可以打开开关;
包括 video 标签, input 标签, 展开可以看到 `#shadow-root`, 它们就是一个 `Shadow dom`;

![image](https://user-images.githubusercontent.com/32337542/118634273-ecf82f00-b804-11eb-9a77-a80c38997b93.png)

## 2. 浏览器支持情况

IE 都不支持, Chrome 浏览器绝大部分都支持;
<https://caniuse.com/shadowdomv1>

![image](https://user-images.githubusercontent.com/32337542/118631699-588ccd00-b802-11eb-8fbc-ea20f57d6f0e.png)

## 3. 基本用法

使用 `Element.attachShadow()` 将一个 shadow root 附加到一个 HTML 元素上。
可以通过 `Element.shadowRoot` 获取到 Shadow DOM 根元素

```html
<div class="box"></div>
<script>
  var box = document.querySelector(".box");
  // 返回 shadow dom 的根节点
  const shadowRoot = box.attachShadow({ mode: "open" });
  shadowRoot.innerHTML = `<style>h1 {color: red}</style><h1>标题</h1>`;

  console.log(box.shadowRoot?.querySelector("h1")); // <h1>标题</h1>
  console.log(box.shadowRoot?.innerHTML); // <style>h1 {color: red}</style><h1>标题</h1>
</script>
```

或者附加到 自定义元素上;

```html
<my-element></my-element>
<script>
  var box = document.querySelector('my-element');
  ...
</script>
```

## 4. 哪些元素可以附加 Shadow DOM

a 标签, image 标签都不能附加 shadow dom
否则会报错

```
Uncaught DOMException: Failed to execute 'attachShadow' on 'Element': This element does not support attachShadow
    at file:///Users/zhengming/Desktop/test/test.html:17:32
```

支持的标签如下:

```
                +----------------+----------------+----------------+
                |    article     |      aside     |   blockquote   |
                +----------------+----------------+----------------+
                |     body       |       div      |     footer     |
                +----------------+----------------+----------------+
                |      h1        |       h2       |       h3       |
                +----------------+----------------+----------------+
                |      h4        |       h5       |       h6       |
                +----------------+----------------+----------------+
                |    header      |      main      |      nav       |
                +----------------+----------------+----------------+
                |      p         |     section    |      span      |
                +----------------+----------------+----------------+
```

## 3. shadow dom 的 css 样式

shadow dom 里面不能定义 body 元素, 所以 shadow dom 里如果有弹层, 还是会展示在外面的 body 上

1.shadow dom 不会被外面的样式影响

`标题`不是红色

```html
<style>
  h1 {
    color: red;
  }
</style>
<h1>hello World</h1>
<div class="box"></div>
<script>
  var box = document.querySelector(".box");
  const shadowRoot = box.attachShadow({ mode: "open" });
  shadowRoot.innerHTML = `<h1>标题</h1>`;
</script>
```

2.shadow dom 不会影响外面元素的样式

`hello World` 不是红色

```html
<h1>hello World</h1>
<div class="box"></div>
<script>
  var box = document.querySelector(".box");
  const shadowRoot = box.attachShadow({ mode: "open" });
  shadowRoot.innerHTML = `<style>h1{color: blue}</style><h1>标题</h1>`;
</script>
```

3.shadow dom 里的元素可以被插入到 body 中

不管 mode 是 open 还是 closed, 只要能拿到 shadowRoot, 那么就可以完全控制 shadow dom 里面的元素;

所以对于微前端, shadow dom 的元素如果被插入到 body 当中, 比如 antd 里面的弹层, 那么样式隔离就不起作用了。

下面的例子 显示如下:
![image](https://user-images.githubusercontent.com/32337542/118680173-14fd8780-b831-11eb-9421-76506e5cdffb.png)

```html
<style>
  h1 {
    color: red;
  }
</style>
<h1>hello World</h1>
<div class="box"></div>
<script>
  var box = document.querySelector(".box");
  const shadowRoot = box.attachShadow({ mode: "closed" });
  shadowRoot.innerHTML = `
        <style>
            h1 { color: blue }
        </style>
        <h1>标题</h1>`;
  document.body.appendChild(shadowRoot.querySelector("h1"));
</script>
```

4.shadow dom 的 open 和 closed 的区别

设置 `mode` 为`open` 的时候, 可以通过外层元素的 shadowRoot 获得对 shadow dom 的控制;

```html
<style>
  h1 {
    color: red;
  }
</style>
<h1>hello World</h1>
<div class="box"></div>
<script>
  var box = document.querySelector(".box");
  const shadowRoot = box.attachShadow({ mode: "open" });
  shadowRoot.innerHTML = `
        <style>
            h1 { color: blue }
        </style>
        <h1>标题</h1>`;
</script>
<script>
  const h1 = document.querySelector(".box").shadowRoot?.querySelector("h1");
  console.log(h1); // <h1>标题</h1>
</script>
```

设置 `mode` 为`closed` 的时候, 通过外层则拿不到 shadowRoot 的引用, 值为 `null`

```html
...
<script>
  const shadowRoot = document.querySelector(".box").shadowRoot;
  console.log(shadowRoot); // null
</script>
```

## 4. shadow dom 的 js 控制

当一个元素 设置成 shadow dom 的时候，那么子元素是不可见的;
如下, h1 元素不在 shadow-root 下面
![image](https://user-images.githubusercontent.com/32337542/118684902-33658200-b835-11eb-96e6-0f7a9e79bfa7.png)

```js
    <div class="box">
        <h1>
            hello World
        </h1>
    </div>
    <script>
        var box = document.querySelector('.box');
        box.attachShadow({ mode: 'open' });
    </script>
```

解决方式, 获取 box 下面所有的 Children, 并且插入到 shadow dom 里面

```js
var box = document.querySelector(".box");
var shadowRoot = box.attachShadow({ mode: "open" });
[].slice.call(box.children).forEach((child) => {
  shadowRoot.appendChild(child);
});
```

## 5. shadow dom 里的元素可以访问外层 document 和 window 对象

不管 mode 为 'open' 或者 'closed'

```js
<body class="bbbb">
    <div class="box"></div>
    <script>
        var box = document.querySelector('.box');
        var shadowRoot = box.attachShadow({ mode: 'closed' });
        shadowRoot.innerHTML = `<h1>Hello World</h1>`
        const script = document.createElement('script');
        script.innerHTML = `console.log(document.body.classList)`;
        shadowRoot.appendChild(script);
    </script>
</body>
```

:::tip 参考地址
<https://developer.aliyun.com/article/717933>
<https://developer.mozilla.org/zh-CN/docs/Web/Web_Components/Using_shadow_DOM>
:::
