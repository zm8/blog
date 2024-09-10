# 原理篇-事件原理（老版本）

## 一前言

v17 之前 React 事件都是绑定在 document 上，v17 之后 React 把事件绑定在应用对应的容器 container 上，将事件绑定在同一容器统一管理，防止很多事件直接绑定在原生的 DOM 元素上。

## 二独特的事件处理

冒泡阶段 绑定的事件比如: onClick，onChange。
捕获阶段 绑定的事件比如: onClickCapture，onChangeCapture。

## 三 事件合成

- 第一个部分是事件合成系统，初始化会注册不同的事件插件。
- 第二个就是在一次渲染过程中，对事件标签中事件的收集，向 container 注册事件。
- 第三个就是一次用户交互，事件触发，到事件执行一系列过程。

## 事件合成概念

- React 的事件不是绑定在元素上的，而是统一绑定在顶部容器上，在 v17 之前是绑定在 document 上的，在 v17 改成了 app 容器上。这样更利于一个 html 下存在多个应用（微前端）。
- 绑定事件并不是一次性绑定所有事件，比如发现了 onClick 事件，就会绑定 click 事件，比如发现 onChange 事件，会绑定 [blur，change ，focus ，keydown，keyup] 多个事件
- React 合成事件的概念: React 应用中，元素绑定的事件并不是原生的事件，而是 React 合成事件，比如 onClick 是由 click 合成，onChange 是由 blur ，change ，focus 等多个事件合成。

## 事件插件机制

第一个 registrationNameModules ，registrationNameModules 记录了 React 事件（比如 onBlur ）和与之对应的处理插件的映射，比如上述的 onClick ，就会用 SimpleEventPlugin 插件处理，onChange 就会用 ChangeEventPlugin 处理。
React 的事件和事件源是自己合成的，所以对于不同事件需要不同的事件插件处理。

```js
const registrationNameModules = {
    onBlur: SimpleEventPlugin,
    onClick: SimpleEventPlugin,
    onClickCapture: SimpleEventPlugin,
    onChange: ChangeEventPlugin,
    onChangeCapture: ChangeEventPlugin,
    onMouseEnter: EnterLeaveEventPlugin,
    onMouseLeave: EnterLeaveEventPlugin,
    ...
}
```

### 第二个 registrationNameDependencies

这个对象保存了 React 事件和原生事件对应关系。

```js
{
    onBlur: ['blur'],
    onClick: ['click'],
    onClickCapture: ['click'],
    onChange: ['blur', 'change', 'click', 'focus', 'input', 'keydown', 'keyup', 'selectionchange'],
    onMouseEnter: ['mouseout', 'mouseover'],
    onMouseLeave: ['mouseout', 'mouseover'],
    ...
}
```

## 四 事件绑定

如下例子, onChange 和 onClick 会保存在对应 DOM 元素类型 fiber 对象（ hostComponent ）的 memoizedProps 属性上

```jsx
export default function Index(){
  const handleClick = () => console.log('点击事件')
  const handleChange =() => console.log('change事件)
  return <div >
     <input onChange={ handleChange }  />
     <button onClick={ handleClick } >点击</button>
  </div>
}
```

![image](https://user-images.githubusercontent.com/32337542/222088760-eac3bc13-366d-4e7c-b206-38fc14003f21.png)

## 五 事件触发

假设 DOM 结构是如下这样的：

```jsx
export default function Index() {
  const handleClick1 = () => console.log(1)
  const handleClick2 = () => console.log(2)
  const handleClick3 = () => console.log(3)
  const handleClick4 = () => console.log(4)
  return (
    <div onClick={handleClick3} onClickCapture={handleClick4}>
      <button onClick={handleClick1} onClickCapture={handleClick2}>
        点击
      </button>
    </div>
  )
}
```

### 第一步：批量更新

dispatchEvent 执行会传入真实的事件源 button 元素本身，通过元素可以找到 button 对应的 fiber，fiber 和原生 DOM 之间是如何建立起联系的呢？
![image](https://user-images.githubusercontent.com/32337542/222105056-17c7debe-aa73-44d2-9169-460829b2901f.png)
接下来就是批量更新环节，批量更新会 合并 state。

```jsx
export function batchedEventUpdates(fn, a) {
  isBatchingEventUpdates = true //打开批量更新开关
  try {
    fn(a) // 事件在这里执行
  } finally {
    isBatchingEventUpdates = false //关闭批量更新开关
  }
}
```

### 第二步：合成事件源

通过 onClick 找到对应的处理插件 SimpleEventPlugin ，合成新的事件源 e ，里面包含了 preventDefault 和 stopPropagation 等方法。

### 第三步：形成事件执行队列

在第一步通过原生 DOM 获取到对应的 fiber ，接着会从这个 fiber 向上遍历，遇到元素类型 fiber ，就会收集事件，用一个数组收集事件：

- 如果遇到捕获阶段事件 onClickCapture ，就会 unshift 放在数组前面。以此模拟事件捕获阶段。
- 如果遇到冒泡阶段事件 onClick ，就会 push 到数组后面，模拟事件冒泡阶段。
- 一直收集到最顶端 app ，形成执行队列，在接下来阶段，依次执行队列里面的函数。
  4 个事件执行顺序是这样的：
- 首先第一次收集是在 button 上，形成结构 `[ handleClick2 , handleClick1 ]`。
- 然后接着向上收集，遇到父级，收集父级 div 上的事件。`[handleClick4, handleClick2 , handleClick1,handleClick3 ]`。
- 依次执行数组里面的事件，所以打印 4 2 1 3。

![image](https://user-images.githubusercontent.com/32337542/222107933-7b6741c6-8a55-428a-a078-114d37fa26ff.png)

## React 如何模拟阻止事件冒泡

判断当前已经阻止事件冒泡了，则不执行事件队列里面的后续事件。

```js
function runEventsInBatch() {
  const dispatchListeners = event._dispatchListeners
  if (Array.isArray(dispatchListeners)) {
    for (let i = 0; i < dispatchListeners.length; i++) {
      if (event.isPropagationStopped()) {
        /* 判断是否已经阻止事件冒泡 */
        break
      }
      dispatchListeners[i](event) /* 执行真正的处理函数 及handleClick1... */
    }
  }
}
```
