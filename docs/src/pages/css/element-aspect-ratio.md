# 保持元素的宽高比

比如想让宽高比是: `4 / 3`

## 1. 使用 aspect-radio

```vue
<template>
  <div class="item"></div>
</template>

<style scoped>
.item {
  background-color: red;
  width: 50%;
  margin: 0 auto;
  aspect-ratio: 4 / 3;
}
</style>
```

## 2. 考虑兼容性

`inner`要设置 `height` 是包含块宽度的 `75%`, 但是`item` 元素没有宽度, 所以考虑使用`padding-top`, 用 `padding-top` 把这个元素高度撑开。
(PS: `padding` 设置的百分比在 4 个方向上都是相对于包含块的宽度)

```vue
<template>
  <div class="item">
    <div class="inner">
      <div class="container">内容</div>
    </div>
  </div>
</template>

<style scoped>
.item {
  background-color: red;
  width: 50%;
  margin: 0 auto;
}
.inner {
  width: 100%;
  padding-top: 75%;
  position: relative;
}
.container {
  position: absolute;
  inset: 0;
}
</style>
```
