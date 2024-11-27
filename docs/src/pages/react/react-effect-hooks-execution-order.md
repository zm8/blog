# react 中 useEffect 和 useLayoutEffect 的执行时机

## 点击 button 按钮的执行顺序

点击 `button` 的时候, 日志打印顺序是如下, debug 源码发现 `useLayoutEffect` 和 `useEffect` 都是调用微任务执行。

```
start
end
微任务1
useLayoutEffect
useEffect
微任务2
requestAnimationFrame
```

```tsx
import { useEffect, useLayoutEffect, useState } from "react";
function App() {
  const [num, setNum] = useState(1000);
  useLayoutEffect(() => {
    console.log("useLayoutEffect");
  }, [num]);
  useEffect(() => {
    console.log("useEffect");
  }, [num]);
  return (
    <>
      <button
        onClick={() => {
          console.log("start");
          Promise.resolve().then(() => {
            console.log("微任务1");
          });
          setNum(1 * 10000);
          Promise.resolve().then(() => {
            console.log("微任务2");
          });
          window.requestAnimationFrame(() => {
            console.log("requestAnimationFrame");
          });
          console.log("end");
        }}
      >
        button
      </button>
    </>
  );
}
```

## 按钮使用 `startTransition` 的执行顺序

使用`startTransition` 开启了并发渲染, `react` 通过时间切片的形式进行更新, 所以点击 `button` 的时候, 日志打印顺序如下。

Debug `react` 源码发现使用 `MessageChannel` 模拟宏任务来通信。

```
start
end
微任务 1
微任务 2
requestAnimationFrame
useLayoutEffect
useEffect
```

```tsx
<button
  onClick={() => {
    // ... before code
    startTransition(() => {
      setNum(1 * 10000);
    });
    // ... after code
  }}
>
  button
</button>
```

我们可以使用 `MessageChannel` 来测试下执行的顺序, 日志打印顺序如下, 可以看到 `ping` 日志把 `useLayoutEffect` 和 `useEffect` 包起来了。

```
// 其他 log 和上面一样
收到消息： ping-1
useLayoutEffect
useEffect
收到消息： ping-2
```

```tsx
const { port1, port2 } = new MessageChannel();
port2.onmessage = function (event) {
  console.log("收到消息：", event.data);
};

<button
  onClick={() => {
    // ... before code
    port1.postMessage("ping-1");
    startTransition(() => {
      setNum(1 * 10000);
    });
    port1.postMessage("ping-2");
    // ... after code
  }}
>
  button
</button>;
```

## 特殊的 `input` 输入框的执行顺序

`react` 会把 `input` 输入框的交互事件当作高优先级事件, 所以 `useLayoutEffect` 和 `useEffect` 会比微任务先执行。

最终打印日志如下:

```
start
end
useLayoutEffect
useEffect
微任务1
微任务2
requestAnimationFrame
```

```tsx
<input
  onChange={() => {
    console.log("start");
    Promise.resolve().then(() => {
      console.log("微任务1");
    });
    setNum(1 * 10000);
    Promise.resolve().then(() => {
      console.log("微任务2");
    });
    window.requestAnimationFrame(() => {
      console.log("requestAnimationFrame");
    });
    console.log("end");
  }}
/>
```

但是当把 `setNum` 使用 `startTransition` 包裹后, 日志打印顺序和 `button` 使用 `startTransition` 的执行顺序是**一样的**。
