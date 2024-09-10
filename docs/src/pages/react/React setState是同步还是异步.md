# React setState 是同步还是异步

### 结论

1. "Class 组件" 和 "Funciton 组件", 使用合成事件, 执行的时候都是异步的;
2. "Class 组件", 如果在 setTimeout 里, 或者在原生的事件里, 它是同步的;
3. "Funciton 组件", 不管在 setTimeout 和 原生的事件里, 它都是异步的, 监听值的变化只能在 `useEffect` 里面获得;

### 原因

"Class 组件"因为在合成事件里面, 所以 react 会判断当前是否在 batchUpdate 状态, 而执行 setTimeout 里面的代码的时候, isBatchingUpdates 已经变成了 false

```
// 处于 batchUpdate
// isBatchingUpdates = true
setTimeout(()=>{
    // 此时 isBatchingUpdates 已经变成 false
    this.setState({
        a: this.state.a + 1
    });
    console.log(this.state.a); // 输出 1
})
// isBatchingUpdates = false
```

"Function 组件" 由于使用了闭包, 所以获得的值都是异步的。

### 1. 验证结论 1

Class 组件

```js
import { Component } from 'react'

export default class TestClick extends Component {
  constructor() {
    super()
    this.state = {
      a: 0
    }
  }
  doClick = () => {
    this.setState({
      a: this.state.a + 1
    })
    console.log(this.state.a) // 输出 0
  }
  render() {
    return <div onClick={this.doClick}>Click me(Normal)</div>
  }
}
```

Funciton 组件

```js
import { useState } from 'react'

export default function ClickNormal() {
  const [num, setNum] = useState(0)
  return (
    <div
      onClick={() => {
        setNum(num + 1)
        console.log(num) // 输出 0
      }}
    >
      {' '}
      Click Normal{' '}
    </div>
  )
}
```

### 2. 验证结论 2

"Class 组件" 在 setTimeout 里 执行

```js
import { Component } from 'react'

export default class TestClick extends Component {
  constructor() {
    super()
    this.state = {
      a: 0
    }
  }
  doClick = () => {
    setTimeout(() => {
      this.setState({
        a: this.state.a + 1
      })
      console.log(this.state.a) // 输出 1
    })
  }
  render() {
    return <div onClick={this.doClick}>Click me(setTimeout)</div>
  }
}
```

"Class 组件" 在原生事件里 执行

```js
import { Component } from 'react'

export default class TestClick extends Component {
  constructor() {
    super()
    this.state = {
      a: 0
    }
  }
  componentDidMount() {
    document.getElementById('box').addEventListener('click', () => {
      this.setState({
        a: this.state.a + 1
      })
      console.log(this.state.a) // 输出 1
    })
  }
  render() {
    return (
      <div id="box" onClick={this.doClick}>
        Click me(ClickNative)
      </div>
    )
  }
}
```

### 3.验证结论 3

"Funciton 组件" 在 setTimeout 里执行

```js
import { useState } from 'react'

export default function ClickHook() {
  const [num, setNum] = useState(0)
  return (
    <div
      onClick={() => {
        setTimeout(() => {
          setNum(num + 1)
          console.log(num) // 输出 0
        })
      }}
    >
      {' '}
      ClickHook{' '}
    </div>
  )
}
```

"Funciton 组件" 在 原生的事件里 执行;

```js
import { useEffect, useState } from 'react'

export default function ClickHook() {
  const [num, setNum] = useState(0)
  useEffect(() => {
    document.getElementById('ClickHook').addEventListener('click', () => {
      setNum(num + 1)
      console.log(num) // 输出 0
    })
  }, [])
  return <div id="ClickHook"> ClickHook </div>
}
```
