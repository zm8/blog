# flex 和 grid 布局对比

设置完 `flex` 之后, 元素有点像 `inline-block`, 但是设置完 grid, 元素还是像 `block` 的状态。

下面代码都使用 tailwindcss 来布局。

## 一. 项目一排

- flex 设置 `flex`
- grid 设置 `grid grid-flow-col`

```vue
<template>
  <!-- flex -->
  <div class="flex">
    <div class="size-20 bg-red-600"></div>
    <div class="size-10 bg-yellow-300"></div>
  </div>
  <!-- grid -->
  <div class="grid grid-flow-col">
    <div class="size-20 bg-red-600"></div>
    <div class="size-10 bg-yellow-300"></div>
  </div>
</template>
```

![image](https://github.com/user-attachments/assets/86dd2429-786b-4f40-a5da-f639f8633021)

### 1.1 项目在左侧, 中间, 右侧

设置 `justify-start`, `justify-center`, `justify-end`

![image](https://github.com/user-attachments/assets/c1ea328d-8765-42c9-b2d2-dfe258e329c6)

### 2.1 项目垂直居中

设置 `items-center`

![image](https://github.com/user-attachments/assets/90e2539f-d477-46b8-8492-e789467f5ed8)

## 二. 项目两排

- flex 设置 `flex flex-col`
- grid 设置 `grid`

```vue
<template>
  <!-- flex -->
  <div class="flex flex-col">
    <div class="size-20 bg-red-600"></div>
    <div class="size-10 bg-yellow-300"></div>
  </div>
  <!-- grid -->
  <div class="grid">
    <div class="size-20 bg-red-600"></div>
    <div class="size-10 bg-yellow-300"></div>
  </div>
</template>
```

![image](https://github.com/user-attachments/assets/3c64016d-7ffe-467e-95c7-a1dfe82f4350)

### 2.1 项目在左侧, 中间, 右侧

- flex 设置 `items-start`(默认), `items-center`, `items-end`
- grid 设置 `justify-items-start`(默认), `justify-items-center`, `justify-items-end`

![image](https://github.com/user-attachments/assets/f8b82e57-c42a-425f-932b-698938ade2d6)

### 2.2 grid 支持整体移动, flex 不行

- grid 支持整体**居中**, 内容居左 `justify-center`
- grid 支持整体**居右**, 内容居左 `justify-end`

![image](https://github.com/user-attachments/assets/31208f4c-6f65-4c64-8283-29c9902dbe87)

## 三. 项目垂直居中, 整体内容居左

这种时需要 flex 和 grid 都包一层 div

```vue
<template>
  <!-- flex -->
  <div class="flex">
    <div class="flex flex-col items-center">
      <div class="size-20 bg-red-600"></div>
      <div class="size-10 bg-yellow-300"></div>
    </div>
  </div>

  <!-- grid -->
  <div class="grid grid-cols-[auto_1fr]">
    <div class="grid justify-items-center">
      <div class="size-20 bg-red-600"></div>
      <div class="size-10 bg-yellow-300"></div>
    </div>
  </div>
</template>
```

![image](https://github.com/user-attachments/assets/f369f503-1794-4d05-ac43-b1966fe6b02a)
