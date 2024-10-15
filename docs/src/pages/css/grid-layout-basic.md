# grid 布局基础

## 页面布局如下

使用 `tailwindcss` 写的页面结构如下:

```vue
<template>
  <div class="size-[300px] border border-black">
    <div class="size-[50px] bg-red-700"></div>
    <div class="size-[100px] bg-blue-700"></div>
  </div>
</template>
```

<img src="https://github.com/user-attachments/assets/71836d64-35a6-4603-b6da-f85197867496" width="300" height="300" />

## 1. grid 设置后, 内容结构发生了变化

除去它们自身的高度，剩下的高度，它们均等分，即为 `(300-50-100)/2=75`, 也就是图中红色长条

<img src="https://github.com/user-attachments/assets/79b41c2f-9a20-4960-a19c-1bf947d2a27d" width="300" height="300" />

而列方向布局(`grid-auto-flow: column`)也是一样的效果。

<img src="https://github.com/user-attachments/assets/16daa3ee-4190-4b63-8560-0e3888645003" width="300" height="300" />

## 2. 相对于单元格内容的布局

### 2.1 `justify-items` 水平方向

`justify-items: start | center|  end`, 水平方向 '左'、'中'、'右'。

1.`justify-items-start` 左

<img src="https://github.com/user-attachments/assets/4f1fd25e-7c58-470b-9162-bba9778a767f" width="300" height="300" />

2.`justify-items-center` 中

<img src="https://github.com/user-attachments/assets/610e5e17-274f-4cf7-8f3c-b16a12be5e61" width="300" height="300" />

3.`justify-items-end` 右
<img src="https://github.com/user-attachments/assets/f99aa433-cbcc-4463-9e83-2b7acbcf11ce" width="300" height="300" />

### 2.2 `align-items` 垂直方向

`align-items: flex-start | flex-end | center`, 垂直方向 '上'、'中'、'下'。

1.`items-start` 上

<img src="https://github.com/user-attachments/assets/304e8d27-3442-4f96-a5fa-97b8887c09fa" width="300" height="300" />

2.`items-center` 中

<img src="https://github.com/user-attachments/assets/044d8a40-a5c3-41f1-9195-cb4f57b6cb68" width="300" height="300" />

3.`items-end` 下

<img src="https://github.com/user-attachments/assets/3932fa65-da9b-49ce-9bb2-1fd6f2e65a02" width="300" height="300" />

## 3. 把内容当作整体进行布局

### 3.1 `justify-content` '水平方向' 整体布局

`justify-content: flex-start | center | flex-end`, 水平方向 '左'、'中'、'右'。

::: tip

`justify-between` 不起作用。因为这种情况它只有 1 列。

:::

1.`justify-start` 整体 左

<img src="https://github.com/user-attachments/assets/b4fe7bf6-fd8f-4978-b84c-5a0303e3e451" width="300" height="300" />

2.`justify-center` 整体 中

<img src="https://github.com/user-attachments/assets/df545f68-d5c8-494f-8dd5-05a7696f4a08" width="300" height="300" />

3.`justify-end` 整体 右

<img src="https://github.com/user-attachments/assets/470f23c4-d143-4aac-9c63-5e52985b49a3" width="300" height="300" />

### 3.2 `align-content` '垂直方向' 整体布局

`align-content: start | center | end | space-between` 垂直方向 '上'、'中'、'下'、'两端对齐'布局

1.`content-start` 整体 上

<img src="https://github.com/user-attachments/assets/b1e3d732-8e95-4aed-b48d-6048715967c1" width="300" height="300" />

2.`content-center` 整体 中

<img src="https://github.com/user-attachments/assets/5443dddb-44a1-4e2a-bc69-d6350c75cb17" width="300" height="300" />

3.`content-end` 整体 下

<img src="https://github.com/user-attachments/assets/ceb0f205-171d-4c76-8ac3-68399516abf9" width="300" height="300" />

4.`content-between` 两端对齐

<img src="https://github.com/user-attachments/assets/d8e25147-adfe-4bd5-9aa6-80c5a9c7dcc8" width="300" height="300" />

## 4. 设置列方向布局

设置列方向布局 `grid-auto-flow: column`

### 4.1 相对于单元格 '水平方向' 布局

1.`justify-items-start`

<img src="https://github.com/user-attachments/assets/e4daf8cf-bcfc-4e6d-8a23-03445e18aa97" width="300" height="300" />

2.`justify-items-center`

<img src="https://github.com/user-attachments/assets/bb17e73e-70bb-4c8c-ac5f-c504c706a76a" width="300" height="300" />

3.`justify-items-end`

<img src="https://github.com/user-attachments/assets/6b4343c7-6a1a-4e6f-90b5-bc16857414b9" width="300" height="300" />

### 4.2 相对于单元格 '垂直方向' 布局

1.`items-start`

<img src="https://github.com/user-attachments/assets/590a26c4-ef5d-49d0-abf7-028983846458" width="300" height="300" />

2.`items-center`

<img src="https://github.com/user-attachments/assets/c96f16e9-60e1-44ed-9fe1-050cef4407c6" width="300" height="300" />

3.`items-end`

<img src="https://github.com/user-attachments/assets/399aefee-b84e-4bb8-8184-966364d44414" width="300" height="300" />

### 4.3 内容当作整体, '水平方向' 布局

1.`justify-start`

<img src="https://github.com/user-attachments/assets/a177d995-4989-48d0-934a-383cf8bfae98" width="300" height="300" />

2.`justify-center`

<img src="https://github.com/user-attachments/assets/ccbd26a9-c252-4913-aa98-cd38e1b7b9bf" width="300" height="300" />

3.`justify-end`

<img src="https://github.com/user-attachments/assets/3482012e-9f73-4a89-b247-9e81fe7961fd" width="300" height="300" />

4.`justify-between`

<img src="https://github.com/user-attachments/assets/8b77b90d-7ead-4e4f-8f99-26fcbe192c1c" width="300" height="300" />

### 4.4 内容当作整体, '垂直方向' 布局

1.`content-start`

::: tip

`content-between` 不起作用。因为这种情况它只有 1 行。

:::

<img src="https://github.com/user-attachments/assets/e18164ac-5841-4fda-9219-2c0c24ebecc1" width="300" height="300" />

2.`content-center`

<img src="https://github.com/user-attachments/assets/ed79d6c2-d922-4a5d-940c-63a83cae87c1" width="300" height="300" />

3.`content-end`

<img src="https://github.com/user-attachments/assets/a5088ed9-23ea-480f-a8cb-aecf2690b420" width="300" height="300" />

## 5 如何让内容水平和垂直居中

### 1.整体垂直居中-1

综上所诉, 应该把它们当作一个整体进行布局, 所以设置 `justify-center` 和 `content-center`, 或者 `place-content-center`

<img src="https://github.com/user-attachments/assets/814cd2a3-6cd6-404a-8fe5-a9ed719204bd" width="300" height="300" />

### 2. 整体垂直居中-2

红色方块相对于蓝色水平居中

1.设置父元素`place-content-center`, 设置红色方块 `justify-self-center`

<img src="https://github.com/user-attachments/assets/920b999f-b2d0-430b-a645-e3b29b4d1921" width="300" height="300" />

2.设置父元素 `content-center justify-items-center`
<img src="https://github.com/user-attachments/assets/e47bdd6f-f555-403d-bd65-6c16392bee25" width="300" height="300" />
