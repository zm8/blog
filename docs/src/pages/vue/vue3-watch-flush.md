# vue3 watch flush

- `sync`(默认值): 同步触发, 最先执行
- `pre`: 在组件更新之前触发
- `post`: 在组件更新之后触发

单击按钮后, 下面代码最终打印如下, 只有 `post watch` 打印了 DOM 内容。

```
[sync watch]:
Counter changed from 0 to 1

[pre watch]:
Counter changed from 0 to 1
DOM text content is still: DOM Text: 0

[post watch]:
Counter changed from 0 to 1
DOM text content is updated to: DOM Text: 1
```

```vue
<template>
  <div>
    <p>Counter: {{ counter }}</p>
    <p ref="domRef">DOM Text: {{ counter }}</p>
    <button @click="counter++">Increment</button>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";

const counter = ref(0);
const domRef = ref(null);

// sync: 同步触发, 最先执行
watch(
  counter,
  (newVal, oldVal) => {
    console.log("[sync watch]:");
    console.log(`Counter changed from ${oldVal} to ${newVal}`);
  },
  { flush: "sync" }
);

// pre(默认): 在组件更新之前触发
watch(
  counter,
  (newVal, oldVal) => {
    // 此时DOM还未更新
    const domText = domRef.value?.textContent;
    console.log("[pre watch]:");
    console.log(`Counter changed from ${oldVal} to ${newVal}`);
    console.log(`DOM text content is still: ${domText}`);
  },
  { flush: "pre" }
);

// post: 在组件更新之后触发
watch(
  counter,
  (newVal, oldVal) => {
    // 此时DOM已更新
    const domText = domRef.value?.textContent;
    console.log("[post watch]:");
    console.log(`Counter changed from ${oldVal} to ${newVal}`);
    console.log(`DOM text content is updated to: ${domText}`);
  },
  { flush: "post" }
);
</script>
```

:::tip 注意
不是 `post watch` 就能拿到 DOM 的内容。
:::

下面的首次打印还是为 `null`。

```
null
<div>Hello World</div>
```

```vue
<script setup lang="ts">
import { ref, toValue, watch } from "vue";

const divRef = ref<HTMLDivElement | null>(null);

watch(
  () => toValue(divRef),
  (ref) => {
    console.log(ref);
  },
  {
    immediate: true,
    flush: "post"
  }
);
</script>
<template>
  <div ref="divRef">Hello World</div>
</template>
```
