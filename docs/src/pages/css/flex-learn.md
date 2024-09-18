# Flex 学习

## 1: 基本概念

有个水平的主轴（`main axis`）和垂直的交叉轴（`cross axis`）。

容器上一共有 6 个属性:

> flex-direction
> flex-wrap
> flex-flow
> justify-content
> align-items
> align-content

项目上也有 6 个属性

> order
> flex-grow
> flex-shrink
> flex-basis
> flex
> align-self

## 2. 例子

### 2.1. 常规例子

```html
<style type="text/css">
  .container {
    width: 600px;
    height: 300px;
    border: 1px solid blue;
  }

  .div {
    width: 100px;
    height: 100px;
    background-color: green;
    border: 1px solid #ff0000;
  }
</style>

<div class="container">
  <div class="div">1</div>
  <div class="div">2</div>
</div>
```

![image](https://user-images.githubusercontent.com/32337542/58954644-59bac000-87cc-11e9-8a80-81377b962814.png)

#### 2.2 只添加 diplay: flex; 注意 display: inline-flex 会让 box 变成 inline 的属性

```html
<style type="text/css">
  .container {
    display: flex;
  }
</style>
```

![image](https://user-images.githubusercontent.com/32337542/58954608-40b20f00-87cc-11e9-90f0-e6f64ddf0651.png)

若元素比较多, 则他们的宽度会自动压缩:

```html
<div class="container">
  <div class="div">1</div>
  <div class="div">2</div>
  <div class="div">3</div>
  <div class="div">4</div>
  <div class="div">5</div>
  <div class="div">6</div>
  <div class="div">7</div>
  <div class="div">8</div>
  <div class="div">9</div>
  <div class="div">10</div>
  <div class="div">11</div>
  <div class="div">12</div>
  <div class="div">13</div>
</div>
```

![image](https://user-images.githubusercontent.com/32337542/58954470-def1a500-87cb-11e9-8188-f81a655c4ac7.png)

## 3. flex-direction

- row（默认值）：主轴为水平方向，起点在左端。
- row-reverse：主轴为水平方向，起点在右端。
- column：主轴为垂直方向，起点在上沿。
- column-reverse：主轴为垂直方向，起点在下沿。

### 3.1 row-reverse

![image](https://user-images.githubusercontent.com/32337542/58953176-41e13d00-87c8-11e9-891d-da2890322da5.png)

#### 3.2 column

![image](https://user-images.githubusercontent.com/32337542/58954776-af8f6800-87cc-11e9-82f8-91b3ab660283.png)

#### 3.3 column-reverse

![image](https://user-images.githubusercontent.com/32337542/58953217-64735600-87c8-11e9-99b3-67811d59cbb4.png)

## 4. flex-wrap

- nowrap（默认）
- wrap 必须大于 box 的宽度才起作用, 否则和默认的一样
- wrap-reverse

### 4.1 wrap

```html
<style type="text/css">
  .container {
    display: flex;
    flex-direction: wrap;
  }
  .div {
    width: 100px;
    height: 120px;
    background-color: green;
    border: 1px solid #ff0000;
  }
</style>
<div class="container">
  <div class="div">1</div>
  <div class="div">2</div>
  <div class="div">3</div>
  <div class="div">4</div>
  <div class="div">5</div>
  <div class="div">6</div>
  <div class="div">7</div>
  <div class="div">8</div>
</div>
```

![image](https://user-images.githubusercontent.com/32337542/58954540-0b0d2600-87cc-11e9-9c55-6bdfb3f54299.png)

若注释了 `height: 120px`, 效果如下图, 由于 `align-content` 默认为 `stretch`

![image](https://user-images.githubusercontent.com/32337542/58970602-546d6d80-87ec-11e9-96cb-12ded4894f01.png)

若设置 `align-content: flex-start`
![image](https://user-images.githubusercontent.com/32337542/58970817-baf28b80-87ec-11e9-8c9e-849e95249476.png)

### 4.2 wrap-reverse

![image](https://user-images.githubusercontent.com/32337542/58954578-29732180-87cc-11e9-88d4-c0169ae9b7b2.png)

## 5. flex-flow

`flex-flow` 属性是 `flex-direction` 属性和 `flex-wrap` 属性的简写形式
默认值为, `flex-flow: row nowrap;`

## 6. justify-content

- flex-start（默认值）：左对齐
- flex-end：右对齐
- center： 居中
- space-between：两端对齐，项目之间的间隔都相等。
- space-around：项目之间的间隔比项目与边框的间隔大一倍。
- space-evenly: 项目之间的间隔都相等。

### 6.1 flex-end

![image](https://user-images.githubusercontent.com/32337542/58955095-94712800-87cd-11e9-8146-77980c793214.png)

### 6.2 center

![image](https://user-images.githubusercontent.com/32337542/58955122-a226ad80-87cd-11e9-8de2-1b471a887f5f.png)

### 6.3 space-between

![image](https://user-images.githubusercontent.com/32337542/58955144-af439c80-87cd-11e9-859f-f722e4b41506.png)

### 6.4 space-around

20 比 10 大一倍
![image](https://user-images.githubusercontent.com/32337542/58955253-0a758f00-87ce-11e9-9bfa-15244c56f405.png)

### 6.5 space-evenly

![image](https://user-images.githubusercontent.com/32337542/59242333-b7706180-8c3d-11e9-8aff-bb88e4f62ddb.png)

## 7. align-items

- stretch（默认值）：如果项目未设置高度或设为 auto，将占满整个容器的高度。
- flex-start：交叉轴的起点对齐。
- flex-end：交叉轴的终点对齐。
- center：交叉轴的中点对齐。
- baseline: 项目的都以靠近最下面的项目的文字的基线对齐。

### 7.1 stretch

若 div 没有指定 height 或 设置 min-height: 100px;

```html
<style type="text/css">
  .container {
    width: 600px;
    height: 300px;
    border: 1px solid blue;
    display: flex;
  }

  .div {
    width: 100px;
    /* height: 100px; */
    background-color: green;
    border: 1px solid #ff0000;
  }
</style>

<div class="container">
  <div class="div">1</div>
  <div class="div">2</div>
  <div class="div">3</div>
</div>
```

![image](https://user-images.githubusercontent.com/32337542/58960454-cee0c200-87d9-11e9-8215-d0a9a16ad347.png)

### 7.2 flex-start

```html
<style type="text/css">
  .container {
    width: 600px;
    height: 300px;
    border: 1px solid blue;
    display: flex;
    align-items: flex-start;
  }

  .div {
    width: 100px;
    /* height: 100px; */
    background-color: green;
    border: 1px solid #ff0000;
  }
</style>
```

![image](https://user-images.githubusercontent.com/32337542/58960707-4f9fbe00-87da-11e9-8471-ac42b42633bb.png)

### 7.3 flex-end

![image](https://user-images.githubusercontent.com/32337542/58960843-8aa1f180-87da-11e9-856f-a77c32afb3fe.png)

### 7.4 center

```html
<style type="text/css">
  .container {
    width: 600px;
    height: 300px;
    border: 1px solid blue;
    display: flex;
    align-items: center;
  }

  .div {
    width: 100px;
    height: 100px;
    background-color: green;
    border: 1px solid #ff0000;
  }
</style>

<div class="container">
  <div class="div" style="padding-top: 20px;">1</div>
  <div class="div" style="padding-top: 80px;height: 160px;">2</div>
  <div class="div" style="padding-top: 60px;">3</div>
</div>
```

![image](https://user-images.githubusercontent.com/32337542/58961467-c2f5ff80-87db-11e9-9466-b450f07f56f4.png)

### 7.5 baseline

以靠近最下面的项目 2 的文字对齐。
![image](https://user-images.githubusercontent.com/32337542/58961555-ff296000-87db-11e9-9e49-0d8d358a6ab3.png)

## 8. align-content

定义了多根轴线的对齐方式, 所以通常要设置上 flex-wrap: wrap; 这样就会有多根轴线了

- stretch：轴线占满整个交叉轴。(默认)
- flex-start：与交叉轴的起点对齐。
- flex-end：与交叉轴的终点对齐。
- center：与交叉轴的中点对齐。
- space-between：与交叉轴两端对齐，轴线之间的间隔平均分布。
- space-around：项目之间的间隔比项目与边框的间隔大一倍。
- space-evenly: 项目之间的间隔都相等。

### 8.1 stretch -- 像交叉轴的 align-items: stretch 属性

```html
<style type="text/css">
  .container {
    display: flex;
    flex-wrap: wrap;
    align-content: stretch;
  }

  .div {
    height: 120px;
  }
</style>
```

![image](https://user-images.githubusercontent.com/32337542/58971109-5552cf00-87ed-11e9-958e-c4f76ff43585.png)

### 8.2 flex-start -- 像交叉轴的 align-items: flex-start 属性

![image](https://user-images.githubusercontent.com/32337542/58971229-8fbc6c00-87ed-11e9-9e7b-2a97f8168b86.png)

### 8.3 flex-end -- 像交叉轴的 align-items: flex-end 属性

![image](https://user-images.githubusercontent.com/32337542/58971261-a2cf3c00-87ed-11e9-9750-449520c8a8aa.png)

### 8.4 center -- 像交叉轴的 align-items: center 属性

![image](https://user-images.githubusercontent.com/32337542/58971360-dad67f00-87ed-11e9-94ef-9020dc866194.png)

### 8.5 space-between -- 像主轴的 justify-content: space-between

![image](https://user-images.githubusercontent.com/32337542/58971381-e9249b00-87ed-11e9-9683-ff3808a93429.png)

### 8.6 space-around -- 像主轴的 justify-content: space-around

![image](https://user-images.githubusercontent.com/32337542/58971452-140eef00-87ee-11e9-8b01-2a2073753383.png)

### 8.7 space-evenly -- 像主轴的 justify-content: space-evenly

![image](https://user-images.githubusercontent.com/32337542/59242747-5cd80500-8c3f-11e9-95e1-7b678f8bb7d3.png)

## 9. order

order 属性定义项目的排列顺序。**数值越小**，排列越靠前，默认每个 item 为 0。
所以要让它靠前，它至少要为-1, 或者设置其它的 order 比较大

```css
.div:nth-of-type(3) {
  order: -1;
}
```

![image](https://user-images.githubusercontent.com/32337542/59001320-ab049700-8840-11e9-837b-641235c77821.png)

## 10. flex-grow

- 定义项目的`放大比例`, 默认值为 0
- 何时起作用：和 `flex-shrink` 相反，当空间足够的时候起作用，则空间已经占满(`例子2`)不起作用

例子 1 - 如何计算:

1. 计算剩余空间
   `300 = 600 - 100 - 100 - 100`

2. flex-grow 每份多少
   `300 / (5 + 1) =50`

3. 最终宽度

- `100 + 5 _ 50 = 350`
- `100 + 1 _ 50 = 150`

```html
<style type="text/css">
  .container {
    width: 600px;
    height: 300px;
    border: 1px solid blue;
    display: flex;
  }

  .div {
    width: 100px;
    height: 100px;
    background-color: green;
    border: 1px solid #ff0000;
  }
</style>
<div class="container">
  <div class="div" style="flex-grow: 5;">1</div>
  <div class="div" style="flex-grow: 1;">2</div>
  <div class="div">3</div>
</div>
```

**特殊的情况**
根据上面的计算公示，若只有一个 item 设置 `flex-grow: 1`, 那它和设置 `flex-grow: 100` 是没有区别的，因为剩下的空间都给它占用了。

```html
<div class="container">
  <!-- 设置 1 和 100都没有区别 -->
  <div class="div" style="flex-grow: 1;">1</div>
  <div class="div">2</div>
  <div class="div">3</div>
  <div class="div">4</div>
  <div class="div">5</div>
  <div class="div">6</div>
  <div class="div">7</div>
</div>
```

![image](https://user-images.githubusercontent.com/32337542/59005378-d8a50c80-884f-11e9-9af1-17e231d47d87.png)

例子 2:

```html
<div class="container">
  <!-- flex-grow 不起作用 -->
  <div class="div" style="flex-grow: 5;">1</div>
  <div class="div">2</div>
  <div class="div">3</div>
  <div class="div">4</div>
  <div class="div">5</div>
  <div class="div">6</div>
  <div class="div">7</div>
</div>
```

![image](https://user-images.githubusercontent.com/32337542/59005325-9085ea00-884f-11e9-9c62-ea4a961a16a2.png)

## 11. flex-shrink

- 定义了项目的**缩小比例**，默认为 1。
- 不能设置为负数。**越大越缩小。**
- 仅在里面所有元素的**宽度之和大于**容器的时候才会发生收缩。
- 若所有 `item` 的 `flex-shrink` 属性都为 1，当空间不足时，都将等比例缩小。
- 若某个 `item` 设置为 0, 其他 `item` 都为 1，则空间不足时它不收缩，其它的等比例都收缩。

举例如何计算收缩了多少：

1. 计算多出的部分
   `120 * 7 - 600 = 240`
2. 计算加权综合可得
   `2160 = 240 * 2 + 240 * 2 + 240 * 1 + 240 * 1 + 240 * 1 + 240 * 1 + 240 * 1`
3. 计算溢出的量
   1 和 2 溢出: `(240 * 2 / 2160) * 240 = 53`
   其它溢出: `(240 * 1 / 2160) * 240 = 27`
4. 最后结果的值
   1 和 2 值为: `120 - 53 = 67`
   其它值为: `120 - 27 = 93`

```html
<style type="text/css">
  .container {
    width: 600px;
    height: 300px;
    border: 1px solid blue;
    display: flex;
  }

  .div {
    width: 120px;
    height: 120px;
    background-color: green;
    border: 1px solid #ff0000;
  }
</style>

<div class="container">
  <div class="div" style="flex-shrink: 2;">1</div>
  <div class="div" style="flex-shrink: 2;">2</div>
  <div class="div">3</div>
  <div class="div">4</div>
  <div class="div">5</div>
  <div class="div">6</div>
  <div class="div">7</div>
</div>
```

![image](https://user-images.githubusercontent.com/32337542/59003044-ffab1080-8846-11e9-8237-3383773c5b67.png)

## 12. flex-basis

- 如果没有设置 `flex-basis` 属性，那么 `flex-basis` 的大小就是项目的 `width` 属性的大小
- 如果没有设置 `width` 属性，那么 `flex-basis` 的大小就是项目内容(`content`)的大小
- `flex-basis` 和 `width` 同时存在，则 `width` 属性被忽略
- `flex-basis` 和 `min-width` 或 `max-width` 同时存在, `flex-basis` 被忽略

```html
<style type="text/css">
  .container {
    width: 600px;
    height: 300px;
    border: 1px solid blue;
    display: flex;
  }

  .div {
    width: 100px;
    height: 100px;
    background-color: green;
    border: 1px solid #ff0000;
  }

  .div:nth-of-type(1) {
    flex-basis: 60px;
    width: 10px; /* 被忽略 */
  }
</style>

<div class="container">
  <div class="div">1</div>
  <div class="div">2</div>
  <div class="div">3</div>
</div>
```

![image](https://user-images.githubusercontent.com/32337542/59003688-8e209180-8849-11e9-9348-75a67022dcc2.png)

## 13. flex

是 `flex-grow flex-shrink flex-basis` 的简写，后两个属性可选。
默认值为 `0 1 auto`;

## 14. align-self

- auto(默认值) | `flex-start` | `flex-end` | `center` | `baseline` | `stretch`;
- 比 `align-items` 属性多了一个 auto
- 继承父容器的 `align-items` 属性
- 可覆盖父元素的 `align-items` 的属性

::: tip 参考链接
<https://www.runoob.com/cssref/css3-pr-flex-shrink.html>

<https://www.jianshu.com/p/17b1b445ecd4>

<https://gedd.ski/post/the-difference-between-width-and-flex-basis/>

<http://www.ruanyifeng.com/blog/2015/07/flex-grammar.html>
:::
