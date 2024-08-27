# React Fiber 学习

### 1. fiber 是一个 javascript 对象

```javascript
const fiber = {
	type,
	props,
	parent,
	dom,
};
```

### 2. fiber 有下面 4 个属性

- type: 元素标签, 比如 div, p
- props: 元素属性, 比如 id,href, 并且多了一个 children 来表示是否有子元素
- parent: 父亲 fiber
- dom: 原生 dom, 通过 document.createElement 或 document.createTextNode 创建。

### 3. performUnitOfWork 函数创建 fiber

1. 代码入口是函数 requestIdleCallback, 它会一直循环调度 performUnitOfWork 来创建的 fiber , 并且明确好 fiber 之间的依赖关系 `xxx.chid = yyy; yyy.sibling=ttt `。

2. 当 fiber 全创建好以后(判断 nextUnitOfWork 不存在), dom 的插入, 更新, 移除会一次性执行完(下面代码的 commitRoot)，比如插入 `dom(dom.appendChild)`, 更新 dom 的属性, dom 的移除(`dom.removeChild`)

```javascript
function render(element, container) {
	wipRoot = {
		dom: container,
		props: {
			children: [element],
		},
		alternate: currentRoot,
	};
	deletions = [];
	nextUnitOfWork = wipRoot;
}

let nextUnitOfWork = null;
let currentRoot = null;
let wipRoot = null;
let deletions = null;

function workLoop(deadline) {
	let shouldYield = false;
	while (nextUnitOfWork && !shouldYield) {
		nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
		shouldYield = deadline.timeRemaining() < 1;
	}

	if (!nextUnitOfWork && wipRoot) {
		commitRoot();
	}
	requestIdleCallback(workLoop);
}
// 一旦浏览器空闲，就触发执行单元任务
requestIdleCallback(workLoop);
```

### 4. performUnitOfWork 创建 fiber

dom 元素层级如下:

```javascript
const element = (
	<div id="foo">
		<h1>
			<p></p>
			<i></i>
		</h1>
		<h2>
			<span></span>
			<b></b>
		</h2>
	</div>
);
const container = document.getElementById("root");
Redact.render(element, container);
```

过程如下:

```
fiber = root

创建fiber: div
root.child = div;

------------------
fiber = div

创建fiber: h1
div.child = h1;

创建fiber: h2
h1.sibling = h2;

------------------
fiber = h1

创建fiber: p
h1.child = p;

创建fiber: i;
p.sibling = i;

------------------
fiber = h2

创建fiber: span
h2.child = span;

创建fiber: b
span.sibling = b;
```

图形展示 fiber 的创建顺序如下:
![image](https://user-images.githubusercontent.com/32337542/75864255-afe09080-5e3c-11ea-8798-8eb91cbd331f.png)

代码如下:

```javascript
function performUnitOfWork(fiber) {
	if (!fiber.dom) {
		fiber.dom = createDom(fiber);
	}

	// 子节点 DOM 插到父节点之后
	if (fiber.parent) {
		fiber.parent.dom.appendChild(fiber.dom);
	}

	// 每个子元素创建新的 fiber
	const elements = fiber.props.children;
	let index = 0;
	let prevSibling = null;

	while (index < elements.length) {
		const element = elements[index];

		const newFiber = {
			type: element.type,
			props: element.props,
			parent: fiber,
			dom: null,
		};
		// 根据上面的图示，父节点只链接第一个子节点
		if (index === 0) {
			fiber.child = newFiber;
		} else {
			// 兄节点链接弟节点
			prevSibling.sibling = newFiber;
		}

		prevSibling = newFiber;
		index++;
	}
	// 返回下一个任务单元（fiber）
	// 有子节点直接返回
	if (fiber.child) {
		return fiber.child;
	}
	// 没有子节点则找兄弟节点，兄弟节点也没有找父节点的兄弟节点，
	// 循环遍历直至找到为止
	let nextFiber = fiber;
	while (nextFiber) {
		if (nextFiber.sibling) {
			return nextFiber.sibling;
		}
		nextFiber = nextFiber.parent;
	}
}
```

注意: 上面的代码 每次 performUnitOfWork 执行 dom 的插入 `fiber.parent.dom.appendChild(fiber.dom);`, 会有页面展示 dom 分批显示问题, 后面例子的代码会优化。

### 5. 更新和删除节点

首次 render 的时候, 所有元素的 alternate 都为空。

第 2 次 render 的时候(执行 renderNew), 由于 currentRoot 已经有值，等于 root 节点, 所以 alternate 有值。

`reconcileChildren` 过程如下:

```

---------------- 1次 reconcileChildren
wipFiber = root(fiber)
oldFiber = wipFiber.alternate.child = 旧root(fiber).child = 旧div(fiber)

-------- while 循环
element = 新div(dom)

// 比较了 element和oldFiber 的type。
var sameType = oldFiber && element && element.type === oldFiber.type;

// sameType 为true, 新建fiber
if (sameType) {
  新div(fiber) = {
    type: oldFiber.type,
    props: element.props,
    dom: oldFiber.dom,
    // 复用旧节点的 DOM
    parent: wipFiber,
    alternate: oldFiber,
    effectTag: "UPDATE"
  };
}

// 指向新的 fiber
wipFiber.child = 新div(fiber);


---------------- 2次 reconcileChildren
wipFiber = 新div(fiber)
oldFiber = wipFiber.alternate.child = 旧div(fiber).child = 旧p(fiber)

-------- while 循环
element = 新p(dom)

// type 一样, 新建 p(fiber)
if (sameType) {
  新p(fiber) = ...
}
wipFiber.child = 新p(fiber);

if (oldFiber) {
  // sibling指向了 旧span(fiber)
  oldFiber = oldFiber.sibling();
}

--------------- 3次 在while里面
wipFiber = 新div(fiber)
oldFiber = 旧span(fiber)
element = 新b(dom)

// 比较oldFiber 和 element的type, 显然sameType 为false
// 新建 fiber
if (element && !sameType) {
  newFiber = {
    type: element.type,
    props: element.props,
    dom: null,
    parent: wipFiber,
    alternate: null,
    effectTag: "PLACEMENT" // PLACEMENT 表示需要添加新的节点
  };
}

// 类型不一样, 给 旧的span(fiber)打上标记, 为了以后删除
if (oldFiber && !sameType) {
  oldFiber.effectTag = "DELETION";
  deletions.push(oldFiber);
}

// 指向新的 fiber
新p(fiber).sibling = 新b(fiber);
```

```javascript
import "./index.css";

function createElement(type, props, ...children) {
	return {
		type,
		props: {
			...props,
			children: children.map((child) =>
				typeof child === "object" ? child : createTextElement(child)
			),
		},
	};
}

function createTextElement(text) {
	return {
		type: "TEXT_ELEMENT",
		props: {
			nodeValue: text,
			children: [],
		},
	};
}

function createDom(fiber) {
	const dom =
		fiber.type === "TEXT_ELEMENT"
			? document.createTextNode("")
			: document.createElement(fiber.type);

	updateDom(dom, {}, fiber.props);

	return dom;
}

const isEvent = (key) => key.startsWith("on");
const isProperty = (key) => key !== "children" && !isEvent(key);
const isNew = (prev, next) => (key) => prev[key] !== next[key];
const isGone = (prev, next) => (key) => !(key in next);

// 新增函数，更新 DOM 节点
function updateDom(dom, prevProps, nextProps) {
	// 以 “on” 开头的属性作为事件要特别处理
	// 移除旧的或者变化了的的事件处理函数
	Object.keys(prevProps)
		.filter(isEvent)
		.filter((key) => !(key in nextProps) || isNew(prevProps, nextProps)(key))
		.forEach((name) => {
			const eventType = name.toLowerCase().substring(2);
			dom.removeEventListener(eventType, prevProps[name]);
		});

	// 移除旧的属性
	Object.keys(prevProps)
		.filter(isProperty)
		.filter(isGone(prevProps, nextProps))
		.forEach((name) => {
			dom[name] = "";
		});

	// 添加或者更新属性
	Object.keys(nextProps)
		.filter(isProperty)
		.filter(isNew(prevProps, nextProps))
		.forEach((name) => {
			// React 规定 style 内联样式是驼峰命名的对象，
			// 根据规范给 style 每个属性单独赋值
			if (name === "style") {
				Object.entries(nextProps[name]).forEach(([key, value]) => {
					dom.style[key] = value;
				});
			} else {
				dom[name] = nextProps[name];
			}
		});

	// 添加新的事件处理函数
	Object.keys(nextProps)
		.filter(isEvent)
		.filter(isNew(prevProps, nextProps))
		.forEach((name) => {
			const eventType = name.toLowerCase().substring(2);
			dom.addEventListener(eventType, nextProps[name]);
		});
}

function commitRoot() {
	deletions.forEach(commitWork);
	commitWork(wipRoot.child);
	currentRoot = wipRoot;
	wipRoot = null;
}

function commitWork(fiber) {
	if (!fiber) {
		return;
	}
	const domParent = fiber.parent.dom;
	if (fiber.effectTag === "PLACEMENT" && fiber.dom != null) {
		domParent.appendChild(fiber.dom);
	} else if (fiber.effectTag === "UPDATE" && fiber.dom != null) {
		updateDom(fiber.dom, fiber.alternate.props, fiber.props);
	} else if (fiber.effectTag === "DELETION") {
		domParent.removeChild(fiber.dom);
	}
	commitWork(fiber.child);
	commitWork(fiber.sibling);
}

function render(element, container) {
	wipRoot = {
		dom: container,
		props: {
			children: [element],
		},
		alternate: currentRoot,
	};
	deletions = [];
	nextUnitOfWork = wipRoot;
	console.log(wipRoot);
}

let nextUnitOfWork = null;
let currentRoot = null;
let wipRoot = null;
let deletions = null;

function workLoop(deadline) {
	let shouldYield = false;
	while (nextUnitOfWork && !shouldYield) {
		nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
		shouldYield = deadline.timeRemaining() < 1;
	}

	if (!nextUnitOfWork && wipRoot) {
		commitRoot();
	}

	requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);

function performUnitOfWork(fiber) {
	if (!fiber.dom) {
		fiber.dom = createDom(fiber);
	}

	const elements = fiber.props.children;
	// 原本添加 fiber 的逻辑挪到 reconcileChildren 函数
	reconcileChildren(fiber, elements);

	if (fiber.child) {
		return fiber.child;
	}
	let nextFiber = fiber;
	while (nextFiber) {
		if (nextFiber.sibling) {
			return nextFiber.sibling;
		}
		nextFiber = nextFiber.parent;
	}
}

// 新增函数
function reconcileChildren(wipFiber, elements) {
	let index = 0;
	// 上次渲染完成之后的 fiber 节点, 这里是子节点
	let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
	let prevSibling = null;
	// 扁平化 props.children，处理函数组件的 children
	elements = elements.flat();
	while (index < elements.length || oldFiber != null) {
		// 本次需要渲染的子元素
		const element = elements[index];
		let newFiber = null;
		// 比较当前和上一次渲染的 type，即 DOM tag 'div'，
		// 暂不考虑自定义组件
		const sameType = oldFiber && element && element.type === oldFiber.type;
		// 同类型节点，只需更新节点 props 即可
		if (sameType) {
			newFiber = {
				type: oldFiber.type,
				props: element.props,
				dom: oldFiber.dom, // 复用旧节点的 DOM
				parent: wipFiber,
				alternate: oldFiber,
				effectTag: "UPDATE", // 新增属性，在提交/commit 阶段使用
			};
		}
		// 不同类型节点且存在新的元素时，创建新的 DOM 节点
		if (element && !sameType) {
			newFiber = {
				type: element.type,
				props: element.props,
				dom: null,
				parent: wipFiber,
				alternate: null,
				effectTag: "PLACEMENT", // PLACEMENT 表示需要添加新的节点
			};
		}
		// 不同类型节点，且存在旧的 fiber 节点时，
		// 需要移除该节点
		if (oldFiber && !sameType) {
			oldFiber.effectTag = "DELETION";
			// 当最后提交 fiber 树到 DOM 时，我们是从 wipRoot 开始的，
			// 此时没有上一次的 fiber，所以这里用一个数组来跟踪需要
			// 删除的节点
			deletions.push(oldFiber);
		}
		if (oldFiber) {
			// 同步更新下一个旧 fiber 节点
			oldFiber = oldFiber.sibling;
		}
		if (index === 0) {
			wipFiber.child = newFiber;
		} else {
			prevSibling.sibling = newFiber;
		}
		prevSibling = newFiber;
		index++;
	}
}

const Redact = {
	createElement,
	render,
};

export default Redact;
```

```javascript
import "./index.css";
import Redact from "./Redact";

/** @jsx Redact.createElement */
const container = document.getElementById("root");

const render = () => {
	const element = (
		<div>
			<p></p>
			<span></span>
		</div>
	);
	Redact.render(element, container);
};
render();

window.renderNew = () => {
	const element = (
		<div>
			<p></p>
			<b></b>
		</div>
	);
	Redact.render(element, container);
};
```

若 renderNew 的时候, 第 1 个节点就不一样，如下 div 和 p 节点不一样， 那么代码会走到下面的判断, 注意里面的 alternate 为 null, 那么它就没有旧的节点跟踪了。

```javascript
// 不同类型节点且存在新的元素时，创建新的 DOM 节点
if (element && !sameType) {
	newFiber = {
		type: element.type,
		props: element.props,
		dom: null,
		parent: wipFiber,
		alternate: null,
		effectTag: "PLACEMENT", // PLACEMENT 表示需要添加新的节点
	};
}
```

```javascript
const render = () => {
	const element = (
		<div>
			<p></p>
			<span></span>
		</div>
	);
	Redact.render(element, container);
};

render();

window.renderNew = () => {
	const element = (
		<p>
			<i></i>
			<b></b>
		</p>
	);
	Redact.render(element, container);
};
```

### 6. 函数组件

先看 babel 进行转换下面代码的差异:

```javascript
const el = (
	<App name="foo">
		<span>david</span>
	</App>
);
console.log(el);

const el2 = (
	<div>
		<p></p>
		<b></b>
	</div>
);
console.log(el2);
```

![image](https://user-images.githubusercontent.com/32337542/76189581-0885a400-6216-11ea-85c9-328da5e19a49.png)

- el 的 type 其实就是函数本身。`el2.type` 是 div
- 函数组件对应的 fiber 节点没有 dom 属性，这是和普通的 fiber 节点唯一的区别。

```javascript
//  拿函数组件的父亲的节点的时候，得循环遍历。
let domParentFiber = fiber.parent;
while (!domParentFiber.dom) {
	domParentFiber = domParentFiber.parent;
}

// 移除函数节点的时候，也得循环遍历
function commitDeletion(fiber, domParent) {
	// 当 child 是函数组件时不存在 DOM，
	// 故需要递归遍历子节点找到真正的 DOM
	if (fiber.dom) {
		domParent.removeChild(fiber.dom);
	} else {
		commitDeletion(fiber.child, domParent);
	}
}

// 更新组件的代码区别
// 新增函数，处理函数组件
function updateFunctionComponent(fiber) {
	// 执行函数组件得到 children
	const children = [fiber.type(fiber.props)];
	reconcileChildren(fiber, children);
}
// 新增函数，处理原生标签组件
function updateHostComponent(fiber) {
	if (!fiber.dom) {
		fiber.dom = createDom(fiber);
	}
	reconcileChildren(fiber, fiber.props.children);
}
```

### 7. 函数组件 Hooks

每个 fiber 有个 hooks 属性, 它是个数组, 里面保存 hook 对象, hook 对象有 state 属性 和 queues 属性。

渲染解读如下:

```js
// -------------------- 首次渲染
const hook(1) = {
	state: 1,
	queue: []
}
var setState(1) = function(action) {
    ....
};
wipFiber.hooks.push(hook(1));
return [ hook(1).state, setState(1) ];

// hook(2)
const hook(2) = {
	state: 2,
	queue: []
}
// .....

// -------------------- 当点击按钮1 的时候, 执行 setState(1)
// 把action 放到数组里
hook(1).queue.push(action);

// 改变 nextUnitOfWork, 让 react 重新渲染
wipRoot = {
  dom: currentRoot.dom,
  props: currentRoot.props,
  alternate: currentRoot
};
nextUnitOfWork = wipRoot;
deletions = [];

// -------------------- 等待 react 重新渲染
// 从 queue 里拿出 action, 改变 hook(1).state
hook(1).queue.forEach(function (action) {
    // 根据调用 setState 顺序从前往后生成最新的 state
    hook(1).state = action instanceof Function ? action(hook.state) : action;
});
return [ hook(1).state, setState(1) ];

// 由于hookIndex++ 能取到 hook(2)
var oldHook = wipFiber.alternate &&
                            wipFiber.alternate.hooks &&
                            wipFiber.alternate.hooks[hookIndex];

// 而 hook(2).queue 由于是空数组，所以返回的state不变。
return [ hook(2).state, setState(2) ];
```

```javascript
// 新增变量，渲染进行中的 fiber 节点
let wipFiber = null;
// 新增变量，当前 hook 的索引，以支持同一个函数组件多次调用 useState
let hookIndex = null;
function updateFunctionComponent(fiber) {
	// 更新进行中的 fiber 节点
	wipFiber = fiber;
	// 重置 hook 索引
	hookIndex = 0;
	// 新增 hooks 数组以支持同一个组件多次调用 useState
	wipFiber.hooks = [];
	const children = [fiber.type(fiber.props)];
	reconcileChildren(fiber, children);
}
function useState(initial) {
	// alternate 保存了上一次渲染的 fiber 节点
	const oldHook =
		wipFiber.alternate &&
		wipFiber.alternate.hooks &&
		wipFiber.alternate.hooks[hookIndex];
	const hook = {
		// 第一次渲染使用入参，第二次渲染复用前一次的状态
		state: oldHook ? oldHook.state : initial,
		// 保存每次 setState 入参的队列
		queue: [],
	};
	const actions = oldHook ? oldHook.queue : [];
	actions.forEach((action) => {
		// 根据调用 setState 顺序从前往后生成最新的 state
		hook.state = action instanceof Function ? action(hook.state) : action;
	});
	// setState 函数用于更新 state，入参 action
	// 是新的 state 值或函数返回新的 state
	const setState = (action) => {
		hook.queue.push(action);
		// 下面这部分代码和 render 函数很像，
		// 设置新的 wipRoot 和 nextUnitOfWork
		// 浏览器空闲时即开始重新渲染。
		wipRoot = {
			dom: currentRoot.dom,
			props: currentRoot.props,
			alternate: currentRoot,
		};
		nextUnitOfWork = wipRoot;
		deletions = [];
	};
	// 保存本次 hook
	wipFiber.hooks.push(hook);
	hookIndex++;
	return [hook.state, setState];
}
```

```javascript
/** @jsx Redact.createElement */
function Counter(props) {
	const [state, setState] = Redact.useState(1);
	const [state2, setState2] = Redact.useState(2);
	return (
		<div>
			<h1>Count: {state}</h1>
			<button onClick={() => setState((c) => c + 1)}>Click me</button>

			<h1>Count2: {state2}</h1>
			<button onClick={() => setState2((c) => c + 1)}>Click me</button>

			{props.children}
		</div>
	);
}

const element = (
	<Counter>
		<p>Child node</p>
	</Counter>
);
const container = document.getElementById("root");
Redact.render(element, container);
```

若点击按钮, 执行 2 次 `setState(c => c + 1)` 则数字会累加 2 次, 而 `setState(state + 1)` 却只能累加 1 次。

执行 2 遍 `setState(state + 1) `

只是把 2 个 **数字 2** 传入到 hook.queue

```javascript
const setState = action => {
    hook.queue.push(action);
    ...
};
```

循环遍历 `hook.queue`, `hook.state` 最后赋值两遍为 2

```javascript
hook.queue.forEach((action) => {
	// 根据调用 setState 顺序从前往后生成最新的 state
	hook.state = action instanceof Function ? action(hook.state) : action;
});
```

执行 2 遍 `setState(c => c + 1) `

每次执行 `action(hook.state)`, 都会传入新的 `hook.state`

```javascript
hook.state = action instanceof Function ? action(hook.state) : action;
```

::: tip 参考链接
https://devrsi0n.com/articles/create-react-from-scratch

https://pomb.us/build-your-own-react/
:::
