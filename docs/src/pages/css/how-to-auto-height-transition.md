# 如何实现高度自动过渡

下面这段代码, 当鼠标 hover 按钮的时候, 让高度自动过渡。

由于 css 的动画必须是数值, `height: auto` 不是数值, 所以不起作用。

```vue
<template>
  <button class="h-10 w-20 bg-blue-500 text-white">hover me</button>
  <div class="detail mt-1 w-60 bg-blue-500 text-white">
    一只乌鸦口渴了，它在低空盘旋着找水喝。找了很久，它才发现不远处有一个水瓶，便高兴地飞了过去，稳稳地停在水瓶口，准备痛快地喝水了。可是，水瓶里水太少了，瓶口又小，瓶颈又长，乌鸦的嘴无论如何也够不着水。这可怎么办呢？
  </div>
</template>

<style scoped>
.detail {
  height: 0;
  transition: 0.5s;
}
button:hover + .detail {
  height: auto;
}
</style>
```

## 1. 使用 grid 布局

开始设置 `0fr` 则不占空间, hover 的时候设置 `1fr`。

注意 `content` 元素得设置 `overflow:hidden`, 否则不起作用。

```vue
<template>
  <button class="h-10 w-20 bg-blue-500 text-white">hover me</button>
  <div class="detail">
    <div class="content mt-1 w-[300px] bg-blue-500 text-white">
      一只乌鸦口渴了，它在低空盘旋着找水喝。找了很久，它才发现不远处有一个水瓶，便高兴地飞了过去，稳稳地停在水瓶口，准备痛快地喝水了。可是，水瓶里水太少了，瓶口又小，瓶颈又长，乌鸦的嘴无论如何也够不着水。这可怎么办呢？
    </div>
  </div>
</template>

<style scoped>
button + .detail {
  display: grid;
  grid-template-rows: 0fr;
  transition: 0.5s;

  .content {
    overflow: hidden;
  }
}
button:hover + .detail {
  grid-template-rows: 1fr;
}
</style>
```

## 2. 使用 js

```vue
<script lang="ts" setup>
import { useTemplateRef } from "vue";
const refDetail = useTemplateRef("detailRef");

const onmouseenter = () => {
  const detail = refDetail.value;
  if (!detail) return;
  detail.style.height = "auto";
  const { height } = detail.getBoundingClientRect();
  detail.style.height = "0";
  detail.offsetHeight; // 强行让它渲染1次
  detail.style.height = height + "px";

  // 或者使用 raf
  // window.requestAnimationFrame(() => {
  //   detail.style.height = height + "px";
  // });
};

const onmouseleave = () => {
  const detail = refDetail.value;
  if (!detail) return;
  detail.style.height = "0";
};
</script>

<template>
  <button
    class="h-10 w-20 bg-blue-500 text-white"
    :onmouseenter="onmouseenter"
    :onmouseleave="onmouseleave"
  >
    hover me
  </button>
  <div class="detail mt-1 w-[300px] bg-blue-500 text-white" ref="detailRef">
    一只乌鸦口渴了，它在低空盘旋着找水喝。找了很久，它才发现不远处有一个水瓶，便高兴地飞了过去，稳稳地停在水瓶口，准备痛快地喝水了。可是，水瓶里水太少了，瓶口又小，瓶颈又长，乌鸦的嘴无论如何也够不着水。这可怎么办呢？
  </div>
</template>

<style scoped>
.detail {
  transition: 0.5s;
  height: 0;
}
</style>
```
