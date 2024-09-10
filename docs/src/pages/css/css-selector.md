# CSS 选择器

## 1. 基础选择器

- tag 标签选择器
- id 选择器
- class 类选择器
- `*` 通配符选择器

## 2.层次选择器

- `elemP elemC` 后代选择器

- `elemP > elemC` 直接后代选择器

- `elem1 + elem2` 相邻兄弟选择器

- `elem1 ~ elem2` 相邻后面的所有兄弟选择器

## 3. 集合选择器

- `elem1,elem2` 并集选择器
- `elem.class` 交集选择器

## 4. 条件选择器

### 1. `:has` 包含指定元素的元素

### 2. `:is` 指定条件的元素

```css
/* 等效于 ul li, ol li, menu li */
:is(ul, ol, menu) li {
  margin-bottom: 10px;
}
```

### 3. `:where` 指定条件的元素

`:where` 和 `:is` 的区别

- `:where` 里面的优先级始终为 0,不管内部选择器的优先级如何。
- `:is` 继承并使用内部选择器的最高优先级。

```html
<style>
  .div-1 span {
    color: black;
  }
  :where(.div-1) span {
    color: red; /* 不生效 */
  }

  .div-2 span {
    color: black;
  }
  :is(.div-2) span {
    color: red; /* 生效 */
  }
</style>
<div class="div-1">
  <span>black-黑色</span>
</div>
<div class="div-2">
  <span>red-红色</span>
</div>
```

### 4. `:not` 非指定条件的元素

```html
<style>
  body :not(div) span {
    color: red;
  }
</style>
<body>
  <div>
    <span>正常</span>
  </div>
  <p>
    <span>红色</span>
  </p>
</body>
```

### 5. `:lang` 指定标记语言

```html
<style>
  :lang(en) {
    color: blue;
  }
  div:lang(fr) {
    color: red;
  }
</style>
<div lang="en">蓝色</div>
<div lang="fr">红色</div>
```

### 6. `:dir()` 指定编写方向的元素

```html
<style>
  :dir(rtl) {
    // 从右往左
    color: red;
  }
  :dir(ltr) {
    // 从左往右
    color: blue;
  }
</style>
<div dir="rtl">test1</div>
<div dir="ltr">test2</div>
```

## 5. 结构选择器

### 1. `:nth-child(n)` 元素中指定顺序索引的元素

最小值是从 1 开始，而不是从 0 开始

```html
<!DOCTYPE html>
<head>
  <style>
    p:nth-child(1) {
      color: red;
    }
  </style>
</head>
<html>
  <div>
    <p>这是第一段。(红色)</p>
    <p>这是第二段。</p>
    <p>这是第三段。</p>
    <p>这是第四段。</p>
  </div>
</html>
```

### 2. `:first-child` 元素中为首的元素

### 3. `:last-child` 元素中为尾的元素

### 4. `:only-child` 父元素仅有该元素的元素

`p` 里面的内容是`红色`。

若 `div` 里面有 2 个 p 元素, 则 2 个 p 元素内容都不是红色。

```html
<!DOCTYPE html>
<head>
  <style>
    div p:only-child {
      color: red;
    }
  </style>
</head>
<html>
  <body>
    <div>
      <p>I am an only child.(红色)</p>
    </div>
  </body>
</html>
```

### 5. `:nth-last-child(n)` 元素中指定逆序索引的元素

### 6. `:nth-of-type(n)` 和 `:nth-last-of-type(n)`

标签中指定顺序索引的标签 和 标签中指定逆序索引的标签

```js
<!DOCTYPE html>
<head>
  <style>
    /* 奇数段 */
    p:nth-of-type(2n + 1) {
      color: red;
    }

    /* 偶数段 */
    p:nth-of-type(2n) {
      color: blue;
    }
  </style>
</head>
<html>
  <body>
    <div>
      <p>这是第一段。</p>
      <p>这是第二段。</p>
      <p>这是第三段。</p>
      <p>这是第四段。</p>
    </div>
  </body>
</html>
```

### 9. `:first-of-type` 标签中为首的标签

```html
<!DOCTYPE html>
<head>
  <style>
    .parent div:first-of-type {
      color: red;
    }
  </style>
</head>
<html>
  <body>
    <div class="parent">
      <h1>Child</h1>
      <!-- h1:first-child, h1:first-of-type -->
      <div>Child 红色</div>
      <!-- div:nth-child(2), div:first-of-type -->
      <div>Child</div>
      <div>Child</div>
    </div>
  </body>
</html>
```

### 10. `:last-of-type` 标签中为尾标签

### 11. `:only-of-type` 父元素仅有该标签的标签

```html
<!DOCTYPE html>
<head>
  <style>
    .parent div:only-of-type {
      color: red;
    }
  </style>
</head>
<html>
  <body>
    <div class="parent">
      <h1>Child1</h1>
      <div>Child2 红色</div>
      <p>Child3</p>
    </div>
  </body>
</html>
```

### 4. `:nth-last-child(n)` 元素中指定逆序索引的元素

## 6. 属性选择器

1. `[attr]` 指定属性的元素
2. `[attr=val]` 属性等于指定值的元素
3. `[attr*=val]` 属性包含指定值的元素
4. `[attr^=val]` 属性以指定值开头的元素
5. `[attr$=val]` 属性以指定值结尾的元素
6. `[attr~=val]` 属性包含指定值(完整单词)的元素
7. `[attr\|=val]` 属性以指定值(完整单词)开头的元素

`*=` 和 `~=` 的区别是, `~=` 需包含完整的单词。

```html
<!DOCTYPE html>
<head>
  <style>
    div[alt*='hello'] {
      color: red;
    }
    div[alt~='hello'] {
      color: blue;
    }
  </style>
</head>
<html>
  <body>
    <div alt="aahellobb">红色</div>
    <div alt="aa hello bb">蓝色</div>
  </body>
</html>
```

## 7. 伪元素 选择器

### 1. `::before` 在元素前插入的内容

### 2. `::after` 在元素后插入的内容

### 3. `::first-letter` 首字母

```html
<!DOCTYPE html>
<head>
  <style>
    div:first-letter {
      color: red;
    }
  </style>
</head>
<html>
  <body>
    <div>红啊啊啊啊</div>
  </body>
</html>
```

### 4. `::first-line` 元素的首行

![image](https://user-images.githubusercontent.com/32337542/128986975-60906760-544e-413f-8d37-e7b36893fae6.png)

```html
<!DOCTYPE html>
<head>
  <style>
    div:first-line {
      color: red;
    }
  </style>
</head>
<html>
  <body>
    <div style="width: 100px">红红红红红红啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊</div>
  </body>
</html>
```

### 5. `::selection` 鼠标选中的元素

让鼠标选中的元素变红

```html
<!DOCTYPE html>
<head>
  <style>
    div::selection {
      color: red;
    }
  </style>
</head>
<html>
  <body>
    <div>啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊</div>
  </body>
</html>
```

### 6. `::backdrop` 全屏模式的元素

主要是元素全屏的表现，有 dialog, video, image 元素全屏的表现，而不是浏览器全屏的表现。

可参考地址: `https://www.zhangxinxu.com/wordpress/2018/12/css-backdrop-pseudo-element/`

### 7. `::placeholder` 表单元素的占位

`Hello`文字为红色;

```html
<!DOCTYPE html>
<head>
  <style>
    .inp::placeholder {
      color: red;
    }
  </style>
</head>
<html>
  <body>
    <input class="inp" placeholder="Hello" />
  </body>
</html>
```
