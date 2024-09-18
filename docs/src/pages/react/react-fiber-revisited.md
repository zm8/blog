# React Fiber 再学习

### 问题

1. hook 如何和当个组件绑定。
2. 怎么判断组件是移除，增加，删除。

### 1. 从一次最简单的 React 渲染说起

```javascript
const element = <h1 title="hello">Hello World!</h1>;
const container = document.getElementById("root");
ReactDOM.render(element, container);
```

上面的代码 element 是 JSX 语法, JSX 本质上还是 JS, 配合 [@babel/plugin-transform-react-jsx](https://babeljs.io/docs/en/babel-plugin-transform-react-jsx), 会转换成如下:

```js
var element = /*#__PURE__*/ React.createElement(
  "h1",
  {
    title: "hello"
  },
  "Hello World!"
);
```

为了返回如下的格式，后面将说如何实现 `React.createElement`

```javascript
const element = {
  type: "h1",
  props: {
    title: "hello",
    // createElement 第三个及之后参数移到 props.children
    children: "Hello World!"
  }
};
```

### 2. `React.createElement` 实现

首先看一个例子:

```js
const element = (
  <div id="foo">
    Hello World
    <a href="http://www.baidu.com">bar</a>
    <b />
  </div>
);

// jsx 会转换成:
var element = /*#__PURE__*/ React.createElement(
  "div",
  {
    id: "foo"
  },
  "Hello World",
  /*#__PURE__*/ React.createElement(
    "a",
    {
      href: "http://www.baidu.com"
    },
    "bar"
  ),
  /*#__PURE__*/ React.createElement("b", null)
);
```

最终我们希望 element 为, type 是它的元素名, props 里面是它的属性, children 是它的子元素。

```js
{
	type: "div",
	props: {
		id: "foo",
		children: ["Hello World", {
			type: "a",
			props: {
				href: "http://www.baidu.com",
				children: "bar"
			}
		}, {
			type: "b",
			props: {}
		}]
	}
}
```

`React.createElement` 的实现:

```js
function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) => (typeof child === "object" ? child : child))
    }
  };
}
```

这里为了和参考文章的 createElement 一样, 修改了下 createElement

```js
function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) =>
        typeof child === "object" ? child : createTextElement(child)
      )
    }
  };
}

function createTextElement(text) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: []
    }
  };
}
```

### 3. 实现 render 函数

```js
function render(element, container) {
  // 创建节点
  const dom =
    element.type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(element.type);

  const isProperty = (key) => key !== "children";
  Object.keys(element.props)
    .filter(isProperty)
    .forEach((name) => {
      dom[name] = element.props[name];
    });

  // 递归遍历子节点
  element.props.children.forEach((child) => render(child, dom));
  // 插入父节点
  container.appendChild(dom);
}
```

### 4. 并发模式 / Concurrent Mode

#### 1. 起因

由于上面的 render 渲染子节点时递归遍历了整棵树，当页面非常复杂时很容易阻塞主线程。
所以使用 requestIdleCallback 这个 API 来实现并发模式, React 目前已经不用这个 API 了，而是自己实现调度算法 [调度器/scheduler]。(<https://github.com/facebook/react/tree/master/packages/scheduler>)

下面的代码输出 49 点多, 表示当前一帧还有多长时间结束的。

```js
requestIdleCallback((deadline) => {
  // 输出 49 点多
  console.log(deadline.timeRemaining());
});
```

#### 2. 代码解读

1. 不断循环调用 workLoop 方法，来执行下一个单元任务。
2. 当执行完一个单元任务以后，判断当前的帧剩余多少时间, 如果时间少于 1ms, 则不执行下一个单元任务，再循环 1 次 workLoop。

```js
let nextUnitOfWork = null
​
function workLoop(deadline) {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(
      nextUnitOfWork
    );
    // 剩余时间小于1毫秒就退出回调，等待浏览器再次空闲
    shouldYield = deadline.timeRemaining() < 1;
  }
  requestIdleCallback(workLoop);
}
​
requestIdleCallback(workLoop);
​
// 注意，这个函数执行完本次单元任务之后要返回下一个单元任务
function performUnitOfWork(nextUnitOfWork) {
  // TODO
}
```

### 5. Fibers

#### 1. Fibers 数据结构

并发模式下渲染任务 nextUnitOfWork, 而每个任务其实就是一个 fiber。
fiber 的数据结构如下:

```js
{
  type: '',
  props: '',
  parent: fiber,
  dom:'',
};
```

它和 `React.createElement` 的返回的对象的区别是:

1. 多了一个 parent 属性, 指向父亲 fiber。
2. 多了一个 dom 属性, 指向原生的 dom 元素，由 `document.createElement` 或 `document.createTextNode` 创建, 并有 id 或者 href 等属性。

#### 2. Fibers 的渲染顺序和结构

假如渲染树如下:

```html
Redact.render(
<div>
  <h1>
    <p />
    <a />
  </h1>
  <h2 />
</div>
, container )
```

它采用深度优先搜索遍历, 遍历的顺序: root -> div -> h1 -> p -> a -> h1 -> h2 -> div -> root。
**每个 fiber 直接链接它的第一个子节点(child)，子节点链接它的兄弟节点(sibling)，兄弟节点链接到父节点(parent)**。
![image](https://user-images.githubusercontent.com/32337542/99346314-4ec7f280-28cf-11eb-95a6-91e1e4f8e590.png)

#### 3. fibers 代码如下:

1. 初始的任务单元 nextUnitOfWork 由 render 方法创建。
2. 根据上面的图创建各个 fibers 的关系。

```js
// 之前 render 的逻辑挪到这个函数
function performUnitOfWork(fiber) {
  // 创建fiber的 dom 属性
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }

  // 子节点插入到父节点里
  if (fiber.parent) {
    fiber.parent.dom.appendChild(fiber.dom);
  }

  // 为每个子元素创建新的 fiber
  const children = fiber.props.children;
  let index = 0;
  let prevSibling = null;

  // 循环遍历子节点
  while (index < children.length) {
    const element = children[index];

    // 创建新的 Fiber
    const newFiber = {
      type: element.type,
      props: element.props,
      // 子节点链接父节点
      parent: fiber,
      dom: null
    };
    // 父节点只链接第一个子节点
    if (index === 0) {
      fiber.child = newFiber;
    } else {
      // 兄节点 互相链接
      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;
    index++;
  }

  // 有子节点直接返回
  if (fiber.child) {
    return fiber.child;
  }

  // 如果有兄弟节点, 返回兄弟节点, 如果没有, 则找父节点的兄弟节点
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;
  }
  return null;
}
```

:::tip 参考地址
<https://devrsi0n.com/articles/create-react-from-scratch#IV:%20Fibers%20%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84>

<https://pomb.us/build-your-own-react/>

<https://babeljs.io/repl#?browsers=&build=&builtIns=false&spec=false&loose=false&code_lz=MYewdgzgLgBApgGzgWzmWBeGAKAUDGAHgBMBLANxlOIwCIAzEEWmaATyQwG8uZQEQAJwBcMWoLjEWAX2kA-fASIBDOQCNlgwgHpVigoTUxtCg9rLkFASgDcQA&debug=false&forceAllTransforms=false&shippedProposals=false&circleciRepo=&evaluate=true&fileSize=false&timeTravel=false&sourceType=module&lineWrap=true&presets=env%2Ces2017&prettier=false&targets=&version=7.12.3&externalPlugins=%40babel%2Fplugin-transform-react-jsx%407.12.5>
:::
