# flex 和 margin 布局

`margin-left: auto` 的含义是 `left` 方向吃掉剩余空间。
`margin: auto` 的含义是上下左右都吃掉剩余空间。

## 1. 水平垂直居中

```vue
<template>
  <div class="flex size-[300px] border">
    <div class="m-auto size-[100px] bg-red-600"></div>
  </div>
</template>
```

<img width="311" alt="image" src="https://github.com/user-attachments/assets/f374eb3f-b6dd-42a2-9dea-62f1999f2d54">

## 2. 绿色方块居右

绿色方块设置 `margin-left:auto`

```vue
<template>
  <div class="flex h-[50px] w-[400px] border">
    <div class="size-[50px] bg-red-500"></div>
    <div class="size-[50px] bg-yellow-500"></div>
    <div class="ml-auto size-[50px] bg-green-500"></div>
  </div>
</template>
```

<img width="412" alt="image" src="https://github.com/user-attachments/assets/d77be393-29b0-44a8-b358-b2db4bebe2ae">

## 3.绿色和蓝色方块居右

绿色方块设置 `margin-left:auto`

<img width="414" alt="image" src="https://github.com/user-attachments/assets/77662dc7-a029-45d5-8dd9-ea5d9714b266">

```vue
<template>
  <div class="flex h-[50px] w-[400px] border">
    <div class="size-[50px] bg-red-500"></div>
    <div class="size-[50px] bg-yellow-500"></div>
    <div class="ml-auto size-[50px] bg-green-500"></div>
    <div class="size-[50px] bg-blue-500"></div>
  </div>
</template>
```

## 4. 绿色方块 2 侧留白

绿色方块设置 `margin-left:auto; margin-right: auto;`

<img width="407" alt="image" src="https://github.com/user-attachments/assets/b01eefab-6099-4c8a-856f-555a2fdae764">

```vue
<template>
  <div class="flex h-[50px] w-[400px] border">
    <div class="size-[50px] bg-red-500"></div>
    <div class="size-[50px] bg-yellow-500"></div>
    <div class="mx-auto size-[50px] bg-green-500"></div>
    <div class="size-[50px] bg-blue-500"></div>
  </div>
</template>
```

## 5. 列表均等分排列

使用 calc 进行动态的计算。假设每行 7 个元素, 则剩余空间为 `calc((100% - var(--n) * 50px)`, 由于每个元素左右各占一定的 `margin`, 所以还得减去 `var(--n) * 2`。

<img width="607" alt="image" src="https://github.com/user-attachments/assets/54dc45c5-6cc8-4187-83e4-4f69d741418e">

```vue
<template>
  <div class="box">
    <div class="item"></div>
    <div class="item"></div>
    <div class="item"></div>
    <div class="item"></div>
    <div class="item"></div>
    <div class="item"></div>
    <div class="item"></div>
    <div class="item"></div>
    <div class="item"></div>
    <div class="item"></div>
    <div class="item"></div>
    <div class="item"></div>
    <div class="item"></div>
    <div class="item"></div>
    <div class="item"></div>
    <div class="item"></div>
  </div>
</template>

<style scoped>
.box {
  display: flex;
  flex-wrap: wrap;
  width: 600px;
  height: 300px;
  border: 1px solid #000;
  .item {
    width: 50px;
    height: 50px;
    background: red;
    /* 每行 7个 */
    --n: 7;
    --space: calc(100% - var(--n) * 50px);
    --h: calc(var(--space) / var(--n) / 2);
    margin: 20px var(--h);
  }
}
</style>
```
