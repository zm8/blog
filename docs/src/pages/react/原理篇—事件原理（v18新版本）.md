# 原理篇—事件原理（v18 新版本）

## 一 前言

老版本的事件原理有一个问题就是，捕获阶段和冒泡阶段的事件都是模拟的，本质上都是在**冒泡阶段**执行的。
如下例子, 老版本的事件系统:
事件监听 -> 捕获阶段执行 -> 冒泡阶段执行
而新版本的事件系统:
捕获阶段执行 -> 事件监听 -> 冒泡阶段执行

```jsx
function Index() {
  const refObj = React.useRef(null)
  useEffect(() => {
    const handler = () => {
      console.log('事件监听')
    }
    refObj.current.addEventListener('click', handler)
    return () => {
      refObj.current.removeEventListener('click', handler)
    }
  }, [])
  const handleClick = () => {
    console.log('冒泡阶段执行')
  }
  const handleCaptureClick = () => {
    console.log('捕获阶段执行')
  }
  return (
    <button
      ref={refObj}
      onClick={handleClick}
      onClickCapture={handleCaptureClick}
    >
      点击
    </button>
  )
}
```

## 二 事件绑定——事件初始化

在 React 新版的事件系统中，在 createRoot 会一口气向外层容器上注册完全部事件。
如果这个事件既可以冒泡，又可以捕获，则注册 2 次。否则就注册 1 次。

- allNativeEvents：allNativeEvents 是一个 set 集合，保存了 81 个浏览器常用事件。
- nonDelegatedEvents ：这个也是一个集合，保存了浏览器中不会冒泡的事件，一般指的是媒体事件，比如 pause，play，playing 等，还有一些特殊事件，比如 cancel ，close，invalid，load，scroll 。

## 三 事件触发

dispatchEvent 保留核心的代码如下：

```js
batchedUpdates(function () {
  return dispatchEventsForPlugins(
    domEventName,
    eventSystemFlags,
    nativeEvent,
    ancestorInst
  )
})
```

dispatchEventsForPlugins 代码如下:

```js
function dispatchEventsForPlugins(
  domEventName,
  eventSystemFlags,
  nativeEvent,
  targetInst,
  targetContainer
) {
  /* 找到发生事件的元素——事件源 */
  var nativeEventTarget = getEventTarget(nativeEvent)
  /* 待更新队列 */
  var dispatchQueue = []
  /* 找到待执行的事件 */
  extractEvents(
    dispatchQueue,
    domEventName,
    targetInst,
    nativeEvent,
    nativeEventTarget,
    eventSystemFlags
  )
  /* 执行事件 */
  processDispatchQueue(dispatchQueue, eventSystemFlags)
}
```

extractEvents 会往 dispatchQueue 添加一些东东，发生点击事件，会触发 2 次 dispatchEvents，1 次在捕获阶段，1 次在冒泡阶段。
第一次打印：
![image](https://user-images.githubusercontent.com/32337542/222115351-3fd89a1d-cdd0-48e2-9fdc-2621fb4c59ed.png)

第二次打印：
![image](https://user-images.githubusercontent.com/32337542/222115428-960c0f54-eb9c-46c1-b233-ddeceb66e69b.png)

extractEvents 函数的逻辑如下:

```js
var SyntheticEventCtor = SyntheticEvent;
 /* 针对不同的事件，处理不同的事件源 */
 switch (domEventName) {
    case 'keydown':
    case 'keyup':
      SyntheticEventCtor = SyntheticKeyboardEvent;
      break;
    case 'focusin':
      reactEventType = 'focus';
      SyntheticEventCtor = SyntheticFocusEvent;
      break;
    ....
 }
/* 找到事件监听者，也就是我们 onClick 绑定的事件处理函数 */
var _listeners = accumulateSinglePhaseListeners(targetInst, reactName, nativeEvent.type, inCapturePhase, accumulateTargetOnly);
/* 向 dispatchQueue 添加 event 和 listeners  */
if(_listeners.length > 0){
    var _event = new SyntheticEventCtor(reactName, reactEventType, null, nativeEvent, nativeEventTarget);
    dispatchQueue.push({
        event: _event,
        listeners: _listeners
    });
}
```

event 是通过事件插件合成的，是 React 自己创建的事件源对象。捕获阶段的 listener 只有一个，而冒泡阶段的 listener 有两个，这是因为 div button 上都有 onClick 事件。
\_listeners 本质上也是一个对象，里面存放了三个属性:

- currentTarget：发生事件的 DOM 元素。
- instance ： button 对应的 fiber 元素。
- listener ：一个数组，存放绑定的事件处理函数本身

如上可以总结为：
**当发生一次点击事件，React 会根据事件源对应的 fiber 对象，根据 return 指针向上遍历，收集所有相同的事件**，比如是 onClick，那就收集父级元素的所有 onClick 事件，比如是 onClickCapture，那就收集父级的所有 onClickCapture。

得到了 dispatchQueue 之后，就需要 processDispatchQueue 执行事件了，这个函数的内部会经历两次遍历：

- 第一次遍历 dispatchQueue，通常情况下，只有一个事件类型，所以 dispatchQueue 中只有一个元素。
- 接下来会遍历每一个元素的 listener，执行 listener 的时候有一个特点：
  如果是捕获阶段执行的函数，那么 listener 数组中函数，会从后往前执行，如果是冒泡阶段执行的函数，会从前往后执行，用这个模拟出冒泡阶段先子后父，捕获阶段先父后子。

如果一个事件中执行了 `e.stopPropagation`，接下来就可以通过 `event.isPropagationStopped` 来判断是否阻止冒泡，如果阻止，那么就会退出。

```js
/* 如果在捕获阶段执行。 */
if (inCapturePhase) {
  for (var i = dispatchListeners.length - 1; i >= 0; i--) {
    var _dispatchListeners$i = dispatchListeners[i],
      instance = _dispatchListeners$i.instance,
      currentTarget = _dispatchListeners$i.currentTarget,
      listener = _dispatchListeners$i.listener

    if (instance !== previousInstance && event.isPropagationStopped()) {
      return
    }

    /* 执行事件 */
    executeDispatch(event, listener, currentTarget)
    previousInstance = instance
  }
} else {
  for (var _i = 0; _i < dispatchListeners.length; _i++) {
    var _dispatchListeners$_i = dispatchListeners[_i],
      _instance = _dispatchListeners$_i.instance,
      _currentTarget = _dispatchListeners$_i.currentTarget,
      _listener = _dispatchListeners$_i.listener

    if (_instance !== previousInstance && event.isPropagationStopped()) {
      return
    }
    /* 执行事件 */
    executeDispatch(event, _listener, _currentTarget)
    previousInstance = _instance
  }
}
```
