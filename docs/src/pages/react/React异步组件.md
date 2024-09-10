# React 异步组件

### 1. 什么是异步组件

传统模式：渲染组件-> 请求数据 -> 再渲染组件。
异步模式：请求数据-> 渲染组件。

### 2. Suspense 的原理

通过包装一个子组件为一个异步模式(通过下面的 createFetcher 函数, 或者 React.lazy 函数), 然后马上抛出异常,
监听 Suspense 组件里的生命周期函数 componentDidCatch, 它会在监听异常的情况，然后来渲染 <Fallback /> 组件,
最后等异步模式回来的时候, 再渲染 <Children /> 组件;

```js
// Suspense 实现
class Suspense extends React.Component {
  state = { isRender: true }
  componentDidCatch(e) {
    /* 异步请求中，渲染 fallback */
    this.setState({ isRender: false })
    const { p } = e
    Promise.resolve(p).then(() => {
      /* 数据请求后，渲染真实组件 */
      this.setState({ isRender: true })
    })
  }
  render() {
    const { isRender } = this.state
    const { children, fallback } = this.props
    return isRender ? children : fallback
  }
}
```

createFetcher 立马抛出错误, 等拿到结果之后设置 status 为 resolved

```js
// createFetcher
function createFetcher(fn) {
  const fetcher = {
    status: 'pending',
    result: null,
    p: null
  }
  return () => {
    fetcher.p = fn()
    fetcher.p.then((res) => {
      fetcher.status = 'resolved'
      fetcher.result = res
    })
    if (fetcher.status === 'pending') throw fetcher
    if (fetcher.status === 'resolved') return fetcher.result
  }
}
```

LazyCom 的写的 3 种方式:

```js
const LazyCom = createFetcher(async () => {
  await new Promise((resolve) => setTimeout(resolve, 2000))
  return <div>hello ,let us learn React</div>
})
```

```js
import HelloWorld from './HelloWorld'

const LazyCom = createFetcher(
  () =>
    new Promise((resolve) => {
      setTimeout(() => {
        resolve(<HelloWorld />)
      }, 2000)
    })
)
```

```js
const LazyCom = createFetcher(() =>
  import('./HelloWorld').then((res) => {
    return <res.default />
  })
)
```

组件进行包装

```js
export default function Test() {
  return (
    <Suspense fallback={<div>loading...</div>}>
      <LazyCom />
    </Suspense>
  )
}
```

### 正常使用 Suspense

```js
const LazyCom = React.lazy(() => import('./HelloWorld'))

export default function Test() {
  return (
    <React.Suspense fallback={<div>loading...</div>}>
      <LazyCom />
    </React.Suspense>
  )
}
```
