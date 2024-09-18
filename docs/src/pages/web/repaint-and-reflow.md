# 重绘和重排

页面如何渲染

1. 处理 HTML 标记并构建 DOM 树。
2. 处理 CSS 标记并构建 CSSOM 树。
3. DOM 树与 CSSOM 树合并后形成渲染树。
4. 根据渲染树来布局，以计算每个节点的几何信息。
5. 将各个节点绘制到屏幕上。

![image](https://user-images.githubusercontent.com/32337542/117094219-c8786d80-ad95-11eb-9a5f-394201d4f325.png)

上图可以看出 DOM 树包含, html, head, body...etc, 而 CSSOM 数只包含 body, 而渲染树里面没有包含 body;

**回流一定会触发重绘，而重绘不一定会回流**

1. Reflow(回流)

- 页面首次渲染
- 浏览器窗口大小发生改变
- 元素尺寸或位置发生改变
- 元素内容变化（文字数量或图片大小等等）
- 元素字体大小变化
- 添加或者删除可见的 DOM 元素
- 激活 CSS 伪类（例如：:hover）
- 查询某些属性或调用某些方法

```
offsetTop, offsetLeft, offsetWidth, offsetHeight
scrollTop, scrollLeft, scrollWidth, scrollHeight
clientTop, clientLeft, clientWidth, clientHeight
```

以上的属性和方法都会返回最新的布局信息，因此浏览器不得不清空队列，触发回流重绘来返回正确的值。

2. Repaint(重绘)
   当页面中元素样式的改变并不影响它在文档流中的位置时（例如：color、background-color、visibility 等），浏览器会将新样式赋予给元素并重新绘制它，这个过程称为重绘。

::: 参考地址
https://segmentfault.com/a/1190000017329980
https://developers.google.com/web/fundamentals/performance/critical-rendering-path/render-tree-construction?hl=zh-cn
https://www.w3cschool.cn/webpo/wxtf12i0.html
:::
