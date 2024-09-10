# React 面试

## 什么是 fiber?

fiber 是一个虚拟 dom，是一个 链表结构，返回了 return, children, siblings，分别代表 父 fiber，子 fiber 和兄弟 fiber。
每一个 fiber 是一个任务单元，可以中断/挂起/恢复。

React 常用的 fiber 类型, fiber 是个对象, 有很多种类, 比如函数组件, 类组件, dom 元素, 文本节点。
每一个 fiber 都可以作为一个执行单元来处理，所以每一个 fiber 可以根据自身的过期时间 expirationTime（ v17 版本叫做优先级 lane ）来判断是否还有空间时间执行更新，如果没有时间更新，就要把主动权交给浏览器去渲染，做一些动画，重排（ reflow ），重绘 repaints 之类的事情。

## 什么是时间切片?

每一帧花 5ms 来更新，调和每一个 fiber 节点的时候，记录开始时间，如果当前时间超过 5ms，则开启一个宏任务(MessageChannel)，等待浏览器下一帧继续调和，如果当前有紧急任务插入，比如 click 事件，则优先执行紧急任务。

## 什么是并发渲染？

优先执行紧急更新，然后再执行不紧急的更新。
对于每次更新分配一个 lane，区分它的紧急程度。通过 fiber 结构将不紧急的更新拆分成多段，通过宏任务拆分到浏览器中不同帧中。

## React Router 基本原理

1. 基于 hash 实现
   通过监听 hashchange 方法

2. 基于 history 实现
   重写 `history.pushState, history.replaceState` 从而可以监听到事件。
   对于浏览器的前进和后退，监听 popstate 方法。

## 什么是虚拟 DOM?

虚拟 DOM 本质是一个 js 对象，通过虚拟 DOM 就能够完整的绘制出对应真实的 DOM。
虚拟 DOM 本质上就是用一种数据结构来描述界面节点, 借助虚拟 DOM, 带来了跨平台的能力, 一套代码多端运行

### 1. 优点

简单方便: 如果频繁手动操作复杂页面的真实 dom, 繁琐容易出错。
性能方面: 能够避免频繁操作真实 dom，减少回流和重绘。
跨平台: 由于 虚拟 DOM 本质上就是用一种数据结构来描述界面节点，所以有跨平台能力。

2. 缺点
1. 首次渲染的时候把虚拟 dom 转换成真实 dom，比直接操作真实 dom 慢。
1. 虚拟 dom 内存中维护一个额外的虚拟状态，会导致一定的内存消耗。

## diff 算法

非 list 结构是逐层对比。
list 结构，根据 key 和 tag 判断是否为相同节点。

1. 如果新节点比旧节点少，新节点遍历完之后，把旧节点的多余的删除。
   oldChild: ABCD
   newChild: AB

2. 如果是新节点比旧点多，新节点遍历完之后，发现没有 olderFier，直接创建新节点。
   oldChild: AB
   newChild: ABCD

3. 如果节点位置发生了改变，则在旧节点创建一个 map，存储老的 fiber 和对应的 key 的映射，然后去复用老的 fiber
   oldChild: ABCD
   newChild: ABDC

4. 复杂情况(删除 + 新增 + 移动)
   首先 A 被复用，发现 E 的时候，首先会 oldChild 创建一个 map,发现没有 E，则新创建 E，D 和 B 然后复用，最后 C 删除。
   oldChild: A B C D
   newChild: A E D B

React 没有采用双端 diff，是因为 react 的链表是单向(slibing 指向下一个节点)，而不是双向。即使使用双端算法，也应该是在改变比较少的情况下，而不是直接替代 Map。

## hook 对比 class 的优势

1. 逻辑复用
2. 灵活： hook 可以嵌套 hook
3. 组件拆分更容易。

缺点:

1. Hooks 的有一定的规则，不能在条件判断里面写。
2. 不正确的写容易造成死循环，和性能问题。

另外 ErrorBoundary 只能使用 class 组件来写，因为 hooks 没有实现 getDerivedStateFromError， componentDidCatch 生命周期。所以不能用来捕获错误。

## useInsertionEffect, useLayoutEffect, useEffect

useInsertionEffect 是 Dom 变更之前，主要给 css-in-js
useLayoutEffect Dom 已经变更了，在内存里，但是还没渲染出来
useEffect Dom 已经渲染到页面上了，是一个异步的方法

## 高阶函数

参数为组件, 返回值为新组件的函数。

## 事件原理(合成事件)

React 事件绑定到根元素上。并且 onChange 事件是由 `blur，change，focus` 多个事件合成。
当用户点击一个元素的时候，会收集这个元素上的绑定的事件，并且收集这个元素父级绑定的事件，然后形成事件队列，对于捕获的事件放在数组前面，对于其它事件 push 到数组里，然后依次执行里面的事件，如果这个时候某个事件里面阻止冒泡了，则其它事件都不执行了。

## React 17 和 18 的区别

### 1. 自动 Batching

React 把多次的状态更新（state updates），合并到一次渲染中。
比如在 onClick 事件里面，如果 setState 写在异步操作里面，则 2 次 setState 会触发 2 次 re-render。

### 2. 从同步不可中断更新变成了异步可中断更新

useTransition 执行返回一个数组。数组有两个状态值：

- isPending: 指处于过渡状态，正在加载中
- startTransition: 通过回调函数将状态更新包装起来告诉 React 这是一个过渡任务，是一个低优先级的更新，允许标记更新作为一个过渡阶段，React 可以被中断执行。

```js
const [isPending, startTransition] = useTransition()
```

`useSyncExternalStore` 它通过强制的同步状态更新，使得外部 store 可以支持并发读取。主要给第三方的库 redux 使用。

`useInsertionEffect` 允许 css-in-js 库解决在渲染中注入样式的性能问题。执行时机在 useLayoutEffect 之前。

`useDeferredValue`产生一个新的状态是延时状态。

### 3. React17 的 SSR 架构 一切都是串行的，React18 提供 Suspense，优化前端的加载速度和可交互的等待时间。
