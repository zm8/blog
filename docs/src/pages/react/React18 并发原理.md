# React18 并发原理

## 1. 什么是并发

并发 ---- 吃饭吃到一半，电话来了，先去接电话，然后回来继续吃饭。
并行 ---- 吃饭吃到一半，电话来了，一边吃饭一边打电话。
并发是 ** 交替处理多个任务 **。

## 2. React 为什么需要并发

js 是单线程语言，同一时间只能执行一件事情。如果有一个耗时任务占据了线程，那么后续的执行内容都会被阻塞。

## 3. 浏览器的一帧里做了什么？

1. 用户事件：最先执行，比如 click 等事件。
2. js 代码: 宏任务和微任务。React 时间切片也会在这里执行。浏览器觉得宏任务执行时间太久，会下一个宏任务分配到下一帧，避免掉帧。
3. 在渲染前执行 scroll/resize 等事件回调。
4. 在渲染前执行 requestAnimationFrame 回调。
5. html、css 的计算布局绘制
6. requestIdleCallback 执行回调：如果前面的那些任务执行完成了，一帧还剩余时间，那么会调用该函数。
   由于 requestIdleCallback 的兼容性比较差，React 决定自己根据 MessageChannel，自己来实现。

## 4. 时间切片

React 让每一帧只花 5ms 来更新。
解决思路如下:

- 更新开始，记录开始时间 startTime。
- js 代码执行时，记录距离开始时间 startTime 是否超过了 5ms。
- 如果超过了 5ms，那么这个时候就不应该再以同步的形式来执行代码了，否则依然会阻塞后续的代码执行。
  所以这个时候我们需要把后续的更新改为一个宏任务，这样浏览器就会分配给他执行的时机。如果有用户事件进来，那么会执行用户事件，等用户事件执行完成后，再继续执行宏任务中的更新。

## 5. Fiber 架构

虚拟 DOM 一旦暂停对比过程，下次更新时比较麻烦。所以 React 引入了 Fiber 架构。
Fiber 和 虚拟 DOM 最大区别是多加了几个属性:

- return 表示父节点 fiber。
- child 表示子节点的第一个 fiber。
- sibling 表示下一个兄弟节点的 fiber。

## 6. 小结

- 遍历更新每一个 fiber 节点，判断累计时间是否超过 5ms
- 如果超过 5ms，则会开启一个宏任务，浏览器自动分配执行时机，从而不阻塞用户事件。
- 如果更新过程触发了 click 事件，那么会在 5ms 与下一个 5ms 的间隙去执行 click 事件的回调。

## 7. Scheduler 调度

React 通过 `Scheduler` 库来处理时间分片。
遍历 Fiber 节点，创建 Fiber 树，并且标记哪些 Fiber 被更新。
通过 MessageChannel 来开启宏任务，进入到下一次更新。

## 8. 更新优先级

React 更新分为紧急更新(Urgent updates)和过渡更新(Transition updates)。
React 为通过 lane 来分配优先级。
举例：假设有一个更新对同一个属性 count 进行:

```js
<p>You clicked {count} times</p>
<button onClick={() => setCount(count + 1)}>
  A按钮
</button>
<button onClick={() => startTransition(() => { setCount(count + 1) })}>
  B按钮
</button>
```

先点击 B，又点击 A，如果 B 还没更新完，会通过 lan 进行对比，此时会中断 B 更新，开始 A 更新。直到 A 更新完，再重新开始 B 更新。
![image](https://github.com/zm8/blog_old/assets/32337542/a270facb-7570-4d65-a6bc-9bf371d2dd57)

## 9. React18 并发渲染

1. 为什么需要并发更新？
   期望一些不重要的更新不会影响用户操作。

2. 并发模式是怎样的？
   多个更新并存的情况，优先执行紧急更新，其次再执行不紧急更新。

3. 并发模式如何实现？
   通过分配 lane，来区分紧急程度。
   通过 Fiber 结构将不紧急的更新拆分为多段，通过宏任务合理的分配到不同的帧当中。
   高优先的任务会打断低优先级的任务，等高优先级的任务完成之后，再开始低优先级的任务。

## 10. 新特性

### Suspense

v16/v17 版本 Suspense 主要用来 code spliting。
v18 用于将 读取数据 和 指定加载状态分离。

fallback 是指定加载状态或者骨架，List 里面主要用于读取数据。
实现的原理是 unstable_createResource 会抛出一个错误 Promise 被 Suspense 捕获，Promise 执行成功之后重新渲染 组件。

```jsx
const wrappedData = unstable_createResource((pageId) => fetchData(pageId));

function List({ pageId }) {
  const data = wrappedData.read(pageId);

  return data[pageId].map((item) => <li>{item}</li>);
}

// 在需要使用 List 组件的地方包裹一层  Suspense 即可自动控制加载抓昂太
<Suspense fallback={<div>Loading...</div>}>
  <List />
</Suspense>;
```

## useTransition/useDeferredValue

useDeferredValue 将紧急的事变成不紧急的。
而 useTransition 未来可能会用于 routers (page navigations) or data fetching libraries (refetching data)。
和防抖截流的区别是:
防抖和截流必须设置一个阀值，如果**设置过长**，如果列表已经渲染更新很快，则有点浪费。
如果**设置过短**，无法解决列表渲染过长的问题。

## useSyncExternalStore

假设一个低优先的任务又 40 个小更新，它们都获取一个全局状态的值 `globalVariable = 1`，当更新到第 20 个的时候，突然有个事件触发，让 `globalVariable = 2`，这个时候后续的 20 个更新和前面的 20 个更新就会不一致。我们称之为 tearing 撕裂。

当并发更新发生变化的时候，useSyncExternalStore 会让它进行强制渲染。

::: 参考地址
https://juejin.cn/post/7087747915950604318
:::
