# React18 新特性 --- transition

Transition 本质上用来解决并发渲染的问题。用于不是很紧急的更新上。
`startTransition` 依赖于 `concurrent Mode` 渲染并发模式。

## 什么是 startTransition

startTransition 把任务标记为过渡更新的任务，过渡更新的任务会被降低优先级。

```js
startTransition(() => {
  /* 更新任务 */
  setSearchQuery(value)
})
```

## 什么是 useTranstion

和 startTransition 对比，提供了当前是否 pending 状态的标志。

```js
import { useTransition } from 'react'

/* 使用 */
const [isPending, startTransition] = useTransition()

{
  isPending && <Spinner />
}
```

## 什么是 useDeferredValue

它和 useTransition 的区别。
相同点:

- useDeferredValue 本质上和内部实现与 useTransition 一样都是标记成了过渡更新任务。

不同点:

- useDeferredValue 是生成一个新的状态，useTransition 是处理一段逻辑，startTransition 把内部更新的任务变成了过渡任务 transtion。
- useDeferredValue 本质上里面的任务是在 useEffect 里面执行，所以一定程度上更滞后于 useTransition。`useDeferredValue = useEffect + transtion`

## 原理

### startTransition

通过标记开关的形式`transition = 1`，然后在执行批量更新，最后再把 transition 还原回去。

```jsx
export function startTransition(scope) {
  const prevTransition = ReactCurrentBatchConfig.transition
  /* 通过设置状态 */
  ReactCurrentBatchConfig.transition = 1
  try {
    /* 执行更新 */
    scope()
  } finally {
    /* 恢复状态 */
    ReactCurrentBatchConfig.transition = prevTransition
  }
}
```

![image](https://github.com/zm8/blog/assets/32337542/71ddbfd5-c068-42f1-8955-eb4a32fdd83b)

### useTranstion

useTranstion 本质上就是 `useState + startTransition`。
注意下面代码, `setPending(false);` 的任务也是过渡更新的任务，因为这个时候已经标志了 `transition=1`

```jsx
function mountTransition() {
  const [isPending, setPending] = mountState(false)
  const start = (callback) => {
    setPending(true)
    const prevTransition = ReactCurrentBatchConfig.transition
    ReactCurrentBatchConfig.transition = 1
    try {
      setPending(false)
      callback()
    } finally {
      ReactCurrentBatchConfig.transition = prevTransition
    }
  }
  return [isPending, start]
}
```

![image](https://github.com/zm8/blog/assets/32337542/21477272-9a48-4e04-871c-308addd73e2e)

### 3 useDeferredValue

useDeferredValue 本质上是 `useState + useEffect + transition`
通过 useState 保存 value，在 useEffect 中通过 transition 模式来更新 value。

```jsx
function updateDeferredValue(value) {
  const [prevValue, setValue] = updateState(value)
  updateEffect(() => {
    const prevTransition = ReactCurrentBatchConfig.transition
    ReactCurrentBatchConfig.transition = 1
    try {
      setValue(value)
    } finally {
      ReactCurrentBatchConfig.transition = prevTransition
    }
  }, [value])
  return prevValue
}
```

![image](https://github.com/zm8/blog/assets/32337542/36197d2b-8b93-48ec-8b59-327c13c095ce)
