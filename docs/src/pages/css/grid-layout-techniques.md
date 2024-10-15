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
