# CSS 知识点记录

## css 宽度适应内容

使用 `width: fit-content;`

```html
<div class="container">
  <div class="item">Item</div>
  <div class="item">Item with more text in it.</div>
  <div class="item">
    Item with more text in it, hopefully we have added enough text so the text will start to wrap.
  </div>
</div>
<style>
  .container {
    border: 2px solid #ccc;
    padding: 10px;
    width: 20em;
  }
  .item {
    width: fit-content;
    background-color: #8ca0ff;
    padding: 5px;
    margin-bottom: 1em;
  }
</style>
```

![image](https://github.com/user-attachments/assets/0da54264-908e-4093-89bd-61b88d7cea80)

## position 有几种，区别是?

- static: 默认值, 没有定位, 处在正常的文档流中
- relative: 相对定位; 元素并不脱离文档流，因此元素原本的位置会被保留
- absolute: 绝对定位; 是会脱离了文本流的，即在文档中已经不占据位置
- fixed: 绝对定位; 也会脱离文档流, 相对与 body 来定位的
- sticky: 一开始没有脱离文档流, 当页面滚动到这个元素的时候, 则它脱离了文档流，相当于 fixed 定位
- inherit: 继承父元素的属性

## div 占满父级元素余下高度的几种方式

页面结构为:

```html
<style>
  .container {
    height: 400px;
  }
  .one {
    height: 100px;
  }
</style>
<div class="container">
  <div class="one"></div>
  <div class="two"></div>
</div>
```

### 1. 使用 calc

```css
.two {
  height: calc(100% - 100px);
}
```

### 2. 使用绝对定位实现

```css
.container {
  position: relative;
}
.two {
  position: absolute;
  top: 100px;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ff0;
}
```

### 3. 使用 flex

```css
.container {
  display: flex;
  flex-direction: column /* 排列方向 */;
}

.two {
  flex-grow: 1;
}
```

## 设置滚动条的颜色

```html
<style>
  .box {
    width: 300px;
    height: 300px;
    border: 1px solid #000;
    overflow: scroll;
    /*
      -webkit-overflow-scrolling: touch
      会让iOS下滚动条消失, 所以不能加
    */
  }
  .box .inner {
    width: 1000px;
    height: 600px;
  }
  .box::-webkit-scrollbar {
    height: 9px;
  }
  /* 滑块颜色 */
  .box::-webkit-scrollbar-thumb {
    border-radius: 10px;
    background-color: blue;
  }
  /* 轨道颜色 */
  .box::-webkit-scrollbar-track {
    border-radius: 10px;
    background-color: red;
  }
</style>
<div class="box">
  <div class="inner"></div>
</div>
```

![0](https://github.com/user-attachments/assets/9b79d42f-78d4-482a-929a-a73a9663e3c4)

## IE 11 去除 select 框的默认样式

```css
select::-ms-expand {
  display: none;
}
select {
  border: none;
}
```

## CSS Grid 布局中，24 分栏的设计理念

1. 灵活性和精细化控制：24 栏布局提供了更高的灵活性和精细化控制，可以让设计师和开发者更容易地调整和对齐元素。更多的栏数意味着可以实现更小的列宽，从而能够更加精确地控制元素的大小和间距。

2. 可分性：24 是一个可以被多种常见数值整除的数字，例如 2、3、4、6、8、12 等。这使得设计布局时可以更方便地分割和排列元素。例如，可以轻松地创建 3 列（8 栏）、4 列（6 栏）或 6 列（4 栏）布局。

3. 响应式设计：在响应式设计中，双数的栏数（如 12、16、18）更容易处理。因为双数可以更均匀地分割成左右两部分，这在调整页面布局以适应不同屏幕尺寸时非常有用。双数栏数还可以更方便地应用对称布局，确保左右对齐的一致性。

## -webkit-min-device-pixel-ratio 属性

是一个 CSS 属性，用于指定浏览器渲染页面时，使用的设备像素比（Device Pixel Ratio，简称 DPR）。
在不同的设备上，DPR 可能不同：

- 普通屏幕（如大多数桌面显示器）通常为 1。
- 高分辨率屏幕（如 Retina 屏幕）可能为 2 或更高，表示在相同的物理区域内，有更多的逻辑像素来显示更多的细节。
  使用 `-webkit-min-device-pixel-ratio` 可以根据不同的设备像素比为不同的设备设置不同的样式或背景图片，以提高在高分辨率设备上的显示效果。这个属性通常与媒体查询结合使用，例如：

```css
@media only screen and (-webkit-min-device-pixel-ratio: 2),
  only screen and (min-resolution: 2dppx) {
  /* 针对设备像素比为2的高分辨率设备设置样式 */
  /* 比如使用高清图像或者调整字体大小以适应高分辨率 */
}
```

在 CSS 中，**min-resolution** 是一种媒体查询条件，用于选择满足特定分辨率的设备。**2dppx** 代表每个 CSS 像素对应于设备的 2 个物理像素。

**`only screen`** 是一个媒体查询修饰符，用于指定媒体查询只应用于屏幕设备类型。它在某些情况下可以增加浏览器对媒体查询的支持。

**`only screen`** 的作用

- 兼容性：它最初是为了处理旧版浏览器（如 IE9 之前的版本）对媒体查询的错误处理。
- 限定设备类型：它明确指定媒体查询仅应用于屏幕设备，不应用于其他设备类型（如打印机）。

## 如何用 backgroud 模拟 border dashed 的效果

```css
.element {
  height: 1px; /* 元素高度 */
  background: linear-gradient(to right, #658aaa 50%, transparent 50%), linear-gradient(to right, #658aaa
        50%, transparent 50%);
  background-size: 6px 1px; /* 每条虚线的宽度为10px，高度为1px */
  background-position: 0 0, 0 100%; /* 第一条虚线从左上角开始，第二条虚线从右下角开始 */
  background-repeat: repeat-x; /* 沿X轴重复显示 */
}
```

## padding 和 margin 的百分比值

都是基于元素的**宽度**而不是**高度**进行计算的。

## 图片引用的简写方法

```css
.bg {
  background: url(xxx) no-repeat 0 0 / contain;
}
```
