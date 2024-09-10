# React cloneElement 和 createElement

## createElement

用来创建一个组件，它其实是一个 jsx 的语法糖。它生成的 ts 的类型为 `React.createElement`

```js
const element = createElement(type, props, ...children)
```

```jsx
function App() {
  const el = (
    <h1 className="greeting" style={{ color: 'red' }}>
      Hello
    </h1>
  )
  return el
}
```

等价于:

```jsx
function App() {
  const el = React.createElement(
    'h1',
    { className: 'greeting', style: { color: 'red' } },
    'Hello'
  )
  return el
}
```

它的第 1 个参数还可以是一个组件的名字，第 2 个参数传递给组件的属性, 后面的参数为 children。

```tsx
interface Props {
  color: string
  children?: React.ReactNode
}

const Greeting: FC<Props> = (props) => {
  const { color, children } = props
  return <div style={{ color }}>Greeting {children}</div>
}

function App() {
  return createElement(Greeting, { color: 'red' }, <p>David</p>, <p>Zheng</p>)
}

// 或者
function App() {
  return createElement(Greeting, {
    color: 'red',
    children: [<p>David</p>, <p>Zheng</p>]
  })
}
```

等价于:

```jsx
<div style="color: red;">
  Greeting <p>David</p>
  <p>Zheng</p>
</div>
```

## cloneElement

用来 clone 一个组件, 并且覆盖组件的 props。

```js
const clonedElement = cloneElement(element, props, ...children)
```

例子：

```jsx
import { cloneElement } from 'react'

// ...
const clonedElement = cloneElement(
  <Row title="Cabbage">Hello</Row>,
  { isHighlighted: true },
  'Goodbye'
)

console.log(clonedElement) // <Row title="Cabbage" isHighlighted={true}>Goodbye</Row>
```

另外一个具体的例子如下:

```tsx
interface Props {
  title: string
  children?: React.ReactNode
  style?: React.CSSProperties
}

const Greeting: FC<Props> = ({ title, style, children }) => {
  return (
    <h1 title={title} style={style}>
      {children}
    </h1>
  )
}

function App() {
  return cloneElement(
    <Greeting title="David">Hello</Greeting>,
    { title: 'Mike', style: { color: 'red' } },
    'Goodbye'
  )
}
// 相当于   <Greeting title="Mike" style="color: red">Goodbye</Greeting>,
```

## cloneElement 和 createElement 区别

区别是：一个是创建 element，一个是克隆 element 并且改变 props

::: 参考地址
https://react.dev/reference/react/cloneElement
https://react.dev/reference/react/createElement
:::
