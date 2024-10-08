# 创建自定义事件

通过 `new Event(type[, options]);` 来创建一个 Event 对象。通过 `elem.dispatchEvent(event)` 在元素上"运行"它。

`options`有`bubbles`和`cancelable`选项，默认都为 false。

```html
<button id="btn" onclick="console.log(1)">按钮</button>
<script>
  const evt = new Event("click");
  window.btn.dispatchEvent(evt); // 直接派发事件
</script>
```

如果要冒泡到 `document`, 可以指定 `Event` 的第 2 个参数:

```html
<button id="btn" onclick="console.log(1)">按钮</button>
<script>
  document.addEventListener("click", () => {
    console.log("document click");
  });
  const evt = new Event("click", {
    bubbles: true
  });
  window.btn.dispatchEvent(evt); // 直接派发事件
</script>
```

事件名称可以为任意的字符串

```html
<button id="btn" onclick="console.log(1)">按钮</button>
<script>
  document.addEventListener("hello", (e) => {
    console.log("document", e.target.tagName); // 打印: document BUTTON
  });
  const evt = new Event("hello", {
    bubbles: true
  });
  window.btn.dispatchEvent(evt); // 直接派发事件
</script>
```

## `event.isTrusted`

判断是 “真实”用户事件和 通过脚本生成的事件。 `dom.dispatchEvent` 的时候它为 false，用户鼠标点击的时候它为 true。

```html
<button id="btn" onclick="console.log(1)">按钮</button>
<script>
  btn.addEventListener("click", (e) => {
    console.log(e.isTrusted); // 用户点击为 true, 否则为 false
  });
  const evt = new Event("click", {
    bubbles: true
  });
  btn.dispatchEvent(evt);
</script>
```

## [MouseEvent，KeyboardEvent 及其他](https://zh.javascript.info/dispatch-events#mouseeventkeyboardevent-ji-qi-ta)

UI 事件类列表:

- UIEvent
- FocusEvent
- MouseEvent
- WheelEvent
- KeyboardEvent
  对于 UI 事件，建议使用 MouseEvent，而不是 Event。MouseEvent 初始化时 options 可以定义 clientX 和 clientY，但是如果 Event 定义，则不生效。

```js
const evt = new Event("hello", {
  clientX: 100
});
console.log(evt.clientX); // undefined
```

```js
const evt = new MouseEvent("hello", {
  clientX: 100
});
console.log(evt.clientX); // 100
```

## [自定义事件](https://zh.javascript.info/dispatch-events#zi-ding-yi-shi-jian)

自定义事件 有一个附加属性 detail。detail 是固定死的，不能改成 detail2 之类的。

```html
<button id="btn" onclick="console.log(1)">按钮</button>
<script>
  btn.addEventListener("Hello", (e) => {
    console.log(e.detail); // { name: 'David' }
  });
  const evt = new CustomEvent("Hello", {
    detail: { name: "David" },
    bubbles: true
  });
  btn.dispatchEvent(evt);
</script>
```

## [event.preventDefault()](https://zh.javascript.info/dispatch-events#eventpreventdefault)

dispatchEvent 之后有一个反馈，如果监听的事件执行了 `e.preventDefault()`, 则 反馈为 false。

下面的例子, 点击按钮派发一个 hide 事件， rabbit 监听 hide 事件，并且某种条件执行 `e.preventDefault()`, 根据反馈判断是否隐藏兔子。

```html
<pre id="rabbit">
  |\   /|
  \|_|/
  /. .\
  =\_Y_/=
  {>o<}
</pre>
<button id="btn" onclick="hide()">hide</button>
<script>
  function hide() {
    const evt = new CustomEvent("hide", {
      cancelable: true
    });
    const signal = rabbit.dispatchEvent(evt);
    if (!signal) {
      // 如果调用了 e.preventDefault(), 则会返回 false, 表示默认行为不会继续
      alert("The action was prevented by a handler");
    } else {
      rabbit.hidden = true;
    }
  }
  rabbit.addEventListener("hide", (e) => {
    if (confirm("Call preventDefault?")) {
      e.preventDefault();
    }
  });
</script>
```

## [事件中的事件是同步的](https://zh.javascript.info/dispatch-events#shi-jian-zhong-de-shi-jian-shi-tong-bu-de)

输出顺序为：1 → nested → 2。

```html
<button id="btn" onclick="doFn()">按钮</button>
<script>
  function doFn() {
    const evt = new CustomEvent("test-evt", {
      bubbles: true
    });
    alert(1);
    btn.dispatchEvent(evt);
    alert("2");
  }
  document.addEventListener("test-evt", (e) => {
    alert("nested");
  });
</script>
```
