# Houdini

css 动画对于数值类的 css 属性起作用, 而下面的 `--direc` 是数值类, 但是不是 css 属性, 所以通过 `Houdini API` 让它变成 css 属性。

```vue
<template>
  <div class="card"></div>
</template>

<style scoped lang="scss">
@property --direc {
  syntax: "<angle>";
  initial-value: 0deg;
  inherits: false;
}

.card {
  width: 200px;
  height: 300px;
  --direc: 0deg;
  color: red;
  font-size: 2em;
  background-image: linear-gradient(var(--direc), #5ddcff, #3c67e3 43%, #4e00c2);
  animation: rotate 3s linear infinite;
}

@keyframes rotate {
  to {
    --direc: 360deg;
  }
}
</style>
```
