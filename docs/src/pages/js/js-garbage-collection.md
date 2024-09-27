# JS 垃圾回收

## 原生 API FinalizationRegistry 支持监听垃圾回收

```vue
<template>
  <button @click="onClick">回收</button>
</template>
<script setup>
const createfn = () => {
  const obj = {
    a: 1
  };
  return () => obj;
};
let fn = createfn();
let b = fn();

const clean = new window.FinalizationRegistry((key) => {
  console.log("清理", key);
});
clean.register(b, "key");

const onClick = () => {
  console.log("click");
  fn = null;
  b = null;
};
</script>
```
