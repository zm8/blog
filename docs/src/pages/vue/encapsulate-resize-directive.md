# Vue 封装 resize 指令

`borderBoxSize` 边框盒是一个数组, 因为有一些元素它可能生成的不止一个盒子，比如 `li` 元素, 它前面还有一个`点`, 那个`点`它也是一个盒子。不过大部分元素只有一个盒子。

由于有的布局不是从上到下, 可能是从左到右, 或者从右到左布局, 那么它的宽度和从上到下的布局是完全相反的, 宽度变高度了,高度变宽度了。所以使用了 `blockSize` 和 `inlineSize`。

- `blockSize`: 相当于高度
- `inlineSize`: 相当于宽度

最终代码如下:

```ts
// directive/index.ts
import { App } from "vue";
import sizeObserver from "./sizeObserver";

export function setupDirective(app: App<Element>) {
  app.directive("size-ob", sizeObserver);
}
```

```ts
// directive/sizeObserver.ts
import { Directive } from "vue";

const map = new WeakMap();
const ob = new window.ResizeObserver((entries) => {
  for (const entry of entries) {
    const handler = map.get(entry.target);
    if (typeof handler === "function") {
      const { blockSize, inlineSize } = entry.borderBoxSize[0];
      handler({ height: blockSize, width: inlineSize });
    }
  }
});

const sizeObserver: Directive = {
  mounted(el, binding) {
    ob.observe(el);
    map.set(el, binding.value);
  },
  unmounted(el) {
    ob.unobserve(el);
  }
};

export default sizeObserver;
```
