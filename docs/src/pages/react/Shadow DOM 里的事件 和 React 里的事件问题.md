# Shadow DOM 里的事件 和 React 里的事件问题

### 1. document 监听事件

不管 mode 是 open 还是 closed, `e.target` 获取不到具体的元素,
下面的例子只能打印 box 元素，而不能打印 h1 元素;
如果要解决这个问题，只能把事件绑定在 shadowRoot 上面;

```html
<div class="box"></div>
<script>
  var box = document.querySelector('.box')
  var shadowRoot = box.attachShadow({ mode: 'open' })
  shadowRoot.innerHTML = `<h1>Hello World</h1>`
</script>
<script>
  document.addEventListener('click', (e) => {
    console.log(e.target)
  })
</script>
```

### 2. React 里的事件问题

React 的版本 17 才处理好了 shadow Dom 事件问题;
下面的例子在 17 版本前都不能打印 `h1 h1 h1`

```html
<body>
  <div id="root"></div>
  <div id="box"></div>
  <script>
    function App() {
      return (
        <h1
          onClick={() => {
            console.log('h1 h1 h1')
          }}
        >
          Hello World
        </h1>
      )
    }

    const rootElement = document.getElementById('root')
    ReactDOM.render(<App />, rootElement)

    const box = document.querySelector('#box')
    const shodowRoot = box.attachShadow({ mode: 'open' })
    shodowRoot.appendChild(rootElement)
  </script>
</body>
```

### 3. React 其它问题

1. React 如何写 Shadow Dom
   当一个元素被附加了 Shadow DOM 之后, 元素原本的子元素不会显示, 所以需要把所有的子元素都插入到 shadowRoot 里

```js
import React from 'react'
import ReactDOM from 'react-dom'

class ShadowView extends React.Component {
  attachShadow = (host) => {
    const shadowRoot = host.attachShadow({ mode: 'open' })
    //将所有 children 移到 shadowRoot 中
    ;[].slice.call(host.children).forEach((child) => {
      shadowRoot.appendChild(child)
    })
  }
  render() {
    const { children } = this.props
    return <div ref={this.attachShadow}>{children}</div>
  }
}

class App extends React.Component {
  render() {
    return (
      <div>
        <ShadowView>
          <h1>Hello world</h1>
        </ShadowView>
      </div>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('root'))
```

2. React 事件问题
   上面的例子如果给 h1 绑定事件, 那么是不会触发的;

```js
class App extends React.Component {
  render() {
    return (
      <div>
        <ShadowView>
          <h1
            onClick={() => {
              console.log('hahaha')
            }}
          >
            Hello world
          </h1>
        </ShadowView>
      </div>
    )
  }
}
```

需要改造 shadowRoot 渲染子元素的方式, 使用 `ReactDOM.render`

```js
class ShadowView extends React.Component {
  attachShadow = (host) => {
    const shadowRoot = host.attachShadow({ mode: 'open' })
    ReactDOM.render(this.props.children, shadowRoot)
  }
  render() {
    // 这里面不需要包裹 this.props.children 了
    return <div ref={this.attachShadow}></div>
  }
}

class App extends React.Component {
  render() {
    return (
      <div>
        <ShadowView>
          <h1
            onClick={() => {
              console.log('hahaha')
            }}
          >
            Hello world
          </h1>
        </ShadowView>
      </div>
    )
  }
}
```

3. React 的 setState 问题
   然而新的问题 setState 设置上去没作用, 原因是 `ReactDOM.render`时, Shadow dom 和 react 不在一个渲染上下文了

```js
class App extends React.Component {
  state = { message: '...' }
  render() {
    return (
      <div>
        <ShadowView>
          <div>{this.state.message}</div>
          <h1
            onClick={() => {
              console.log('hahaha')
              this.setState({
                message: 'lalalala'
              })
            }}
          >
            Hello world
          </h1>
        </ShadowView>
      </div>
    )
  }
}
```

使用 `ReactDOM.createPortal` 改造代码

```js
const ShadowContent = ({ children, root }) => {
  return ReactDOM.createPortal(children, root)
}

class ShadowView extends React.Component {
  state = { root: null }
  attachShadow = (host) => {
    const shadowRoot = host.attachShadow({ mode: 'open' })
    this.setState({
      root: shadowRoot
    })
  }
  render() {
    // 这里面不需要包裹 this.props.children 了
    return (
      <div>
        <div ref={this.attachShadow}></div>
        {this.state.root && (
          <ShadowContent root={this.state.root}>
            {this.props.children}
          </ShadowContent>
        )}
      </div>
    )
  }
}

class App extends React.Component {
  state = { message: '...' }
  render() {
    return (
      <div>
        <ShadowView>
          <div>{this.state.message}</div>
          <h1
            onClick={() => {
              console.log('hahaha')
              this.setState({
                message: 'lalalala'
              })
            }}
          >
            Hello world
          </h1>
        </ShadowView>
      </div>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('root'))
```

ShadowView 的 hooks 写法:

```js
function ShadowView({ children }) {
  const refDiv = useRef(null)
  const [shadowRoot, setShadowRoot] = useState(null)
  useEffect(() => {
    setShadowRoot(refDiv.current.attachShadow({ mode: 'open' }))
  }, [])
  return (
    <div>
      <div ref={refDiv}></div>
      {shadowRoot && ReactDOM.createPortal(children, shadowRoot)}
    </div>
  )
}
```

::: 参考地址
https://developer.aliyun.com/article/717933
https://zh-hans.reactjs.org/docs/portals.html
:::
