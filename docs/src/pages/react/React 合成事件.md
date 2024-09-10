# React 合成事件

### 导读

React 合成事件（SyntheticEvent）是通过事件委托的方式, 在 document 上添加事件处理器;
React17 不再向 document 附加事件处理器，而将事件处理器附加到渲染 React **树的根 DOM** 容器中。

### 1. 检验是否是事件委托

可以通过 currentTarget 属性检测

React 17 返回:

```
target: <p>Test</p>
currentTarget: <div id="root">...</div>
```

React 16.14 返回:

```
target: <p>Test</p>
currentTarget: document 对象
```

```js
class Test extends React.Component {
  clickEl = (e) => {
    console.log('target:', e.nativeEvent.target)
    console.log('currentTarget:', e.nativeEvent.currentTarget)
  }
  render() {
    return (
      <div>
        <p onClick={this.clickEl}>Test</p>
      </div>
    )
  }
}
```

### 2. 使用合成事件的目的

1. 统一使用事件冒泡委托的方式, 实现更好的跨平台兼容
2. 避免 频繁的创建和销毁事件;
3. 方便事件的统一管理和事物机制

### 3. 合成事件的执行顺序

由于 React 的事件其实是绑定在 Root 上的, 所以原生事件的绑定会 先执行, 然后再执行 Root 上的监听到的事件, 最后才执行 document 绑定的原生事件;

```
原生事件：子元素 DOM 事件监听！
原生事件：父元素 DOM 事件监听！
React 事件：子元素事件监听！
React 事件：父元素事件监听！
原生事件：document DOM 事件监听！
```

```js
class Test extends React.Component {
  constructor() {
    super()
    this.parentRef = React.createRef()
    this.childRef = React.createRef()
  }
  componentDidMount() {
    this.parentRef.current?.addEventListener('click', () => {
      console.log('原生事件：父元素 DOM 事件监听！')
    })
    this.childRef.current?.addEventListener('click', () => {
      console.log('原生事件：子元素 DOM 事件监听！')
    })
    document.addEventListener('click', (e) => {
      console.log('原生事件：document DOM 事件监听！')
    })
  }
  parentClickFun = () => {
    console.log('React 事件：父元素事件监听！')
  }
  childClickFun = () => {
    console.log('React 事件：子元素事件监听！')
  }
  render() {
    return (
      <div ref={this.parentRef} onClick={this.parentClickFun}>
        <div ref={this.childRef} onClick={this.childClickFun}>
          分析事件执行顺序
        </div>
      </div>
    )
  }
}
```

### 4. 原生事件阻止冒泡

首先 document 原生监听肯定不会执行, 而由于 React 是挂载在 root 元素上的, 所以也被阻止了。
PS: React 16.4 的版本打印内容一样。

```
// 打印
原生事件DOM
```

```js
class Test extends React.Component {
  constructor() {
    super()
    this.ref = React.createRef()
  }
  componentDidMount() {
    this.ref.current?.addEventListener('click', (e) => {
      e.stopPropagation()
      console.log('原生事件DOM')
    })
    document.addEventListener('click', () => {
      console.log('原生事件document')
    })
  }
  clickFun = () => {
    console.log('React事件DOM')
  }
  render() {
    return (
      <div ref={this.ref} onClick={this.clickFun}>
        分析事件执行顺序
      </div>
    )
  }
}
```

### 5. React 事件阻止冒泡

由于 react 事件挂载在 root 元素上, root 元素阻止冒泡, 造成 document 上的事件不会执行。

```
// 打印
原生事件DOM
React事件DOM
```

若是 React 16.4 的版本, 则打印如下,
因为此版本的 react 事件绑定到 document 上, 所以它只会阻止冒泡到 window 上(若 window 上有绑定事件, 则不会执行)。

```
原生事件DOM
React事件DOM
原生事件document
```

```js
class Test extends React.Component {
  constructor() {
    super()
    this.ref = React.createRef()
  }
  componentDidMount() {
    this.ref.current?.addEventListener('click', () => {
      console.log('原生事件DOM')
    })
    document.addEventListener('click', () => {
      console.log('原生事件document')
    })
  }
  clickFun = (e) => {
    e.stopPropagation()
    console.log('React事件DOM')
  }
  render() {
    return (
      <div ref={this.ref} onClick={this.clickFun}>
        分析事件执行顺序
      </div>
    )
  }
}
```

::: 参考地址
https://segmentfault.com/a/1190000038251163
https://zh-hans.reactjs.org/blog/2020/08/10/react-v17-rc.html
:::
