# grid 布局技巧

## 1. 左右两侧各占相同空间, 中间内容自适应

```vue
<template>
  <div class="grid h-[100px] w-[500px] grid-cols-[1fr_auto_1fr]">
    <div class="bg-blue-700"></div>
    <div class="bg-red-700">hello</div>
    <div class="bg-yellow-500"></div>
  </div>
</template>
```

<img width="507" alt="image" src="https://github.com/user-attachments/assets/5e275666-51f6-4177-a6eb-49ec32bf44a8">

当然也可以设置让右侧的空间是左侧的空间的 3 倍, `grid-cols-[1fr_auto_3fr]`

## 2. 模拟 flex 的 `flex-grow: 1` 效果

```vue
<template>
  <div class="grid h-[100px] w-[500px] grid-cols-[auto_minmax(0,1fr)]">
    <div class="bg-red-700">hello word</div>
    <div class="bg-blue-700"></div>
  </div>
</template>
```

<img width="507" alt="image" src="https://github.com/user-attachments/assets/eb77d3d6-fee7-4917-a0ea-c13cea20a869">

## 3. 模拟 flex 的均等分效果(即 flex-grow:1)

```vue
<template>
  <div class="grid w-[800px] grid-cols-[repeat(auto-fit,minmax(0,1fr))]">
    <div class="h-[200px] border border-red"></div>
    <div class="h-[200px] border border-red"></div>
    <div class="h-[200px] border border-red"></div>
  </div>
</template>
```

<img width="808" alt="image" src="https://github.com/user-attachments/assets/43509237-aaff-4334-a986-794a39d516b7">

## 4. `auto-fill` 和 `auto-fit` 的区别

`auto-fill` 会尽可能地创建更多的列来填充容器, 会将 `900px` 宽度容器分成多个 `200px` 的列，并且如果内容不足，会仍然`保留空列`，造成`空白区域`，因此会造成显示的内容不居中。

<img width="906" alt="image" src="https://github.com/user-attachments/assets/e979381d-adaa-42fb-9724-ac1b65deef62">

```vue
<template>
  <div
    class="grid w-[900px] grid-cols-[repeat(auto-fill,200px)] justify-center border border-red-500"
  >
    <div class="h-[200px] w-[200px] border border-black"></div>
    <div class="h-[200px] w-[200px] border border-black"></div>
    <div class="h-[200px] w-[200px] border border-black"></div>
  </div>
</template>
```

`auto-fit` 它会根据内容自动收缩不必要的列，空的列会被压缩为 0 宽度，避免浪费空间。上面的代码改成 `grid-cols-[repeat(auto-fit,200px)]` 后，显示的内容就居中了。

<img width="906" alt="image" src="https://github.com/user-attachments/assets/42c1b327-f637-4f34-a6bf-811b00473d30">

## 5. 响应式布局 - 容器宽度不固定

单元格的宽度固定, 容器的宽度不固定，当剩余空间不足一个单元格的时候, 会出现空隙不美观。

![grid](https://github.com/user-attachments/assets/c33b3f3f-e196-4e3e-9b1e-fece133373e9)

```vue
<script setup lang="ts">
const colors = [
  { number: 1, bg: "#EE4B2B", color: "#FFFFFF" },
  { number: 2, bg: "#FFA500", color: "#000000" },
  { number: 3, bg: "#4CAF50", color: "#FFFFFF" },
  { number: 4, bg: "#2196F3", color: "#FFFFFF" },
  { number: 5, bg: "#9C27B0", color: "#FFFFFF" },
  { number: 6, bg: "#FFDAB9", color: "#000000" },
  { number: 7, bg: "#A0938D", color: "#FFFFFF" },
  { number: 8, bg: "#D4E6A5", color: "#000000" },
  { number: 9, bg: "#87CEEB", color: "#000000" }
];
</script>

<template>
  <div class="grid w-[100vw] grid-cols-[repeat(auto-fill,100px)]">
    <div
      v-for="{ number, bg, color } in colors"
      :key="number"
      class="flex aspect-square flex-col items-center justify-center"
      :style="{ backgroundColor: bg, color: color }"
    >
      <div class="text-3xl">{{ number }}</div>
    </div>
  </div>
</template>
```

### 使用 🎉 `auto-fill & minmax`

代码改成 `grid-cols-[repeat(auto-fill,minmax(100px,1fr))]`

![grid2](https://github.com/user-attachments/assets/3440c30e-c30a-48ef-925f-4b8916191c4a)
