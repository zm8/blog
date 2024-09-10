# SCSS 学习

## 前言

sass 是最早出现的 css 预处理语言，有着比 less 更强大的功能。采用 Ruby 语言编写。

最初版本采用的是严格缩进的风格（不带大括号( {} )和分号( ; )，这一语法也导致一开始，sass 并不太为开发者所接受）。

从 V3 版本开始放弃了缩进式的风格，并完全兼容普通的 css 代码，也因此从第三代开始，sass 也被称为 scss。

## 1.变量

sass 中的变量定义是以 **$** 开头。

```scss
$blue: #1875e7;
div {
  　color: $blue;
}
```

变量的值也可以引用其他变量:

```scss
$color: red;
$border: 1px solid $color; // 引用了 $color

.box {
  border: $border;
}

// 编译为
.box {
  border: 1px solid red;
}
```

属性名和值都使用变量, 写的时候 变量必须放在 **#{}** 里面:

```scss
$value: 'red';

.box_#{$value} {
  color: #{$value};
}

// 编译为：
.nav_red {
  color: red;
}
```

## 2. 嵌套

scss 结合 css module 的一种写法:

```tsx
// index.tsx
import styles from './index.module.scss'
function Comp() {
  return (
    <div className={styles.box}>
      <div className={styles.text}>你好</div>
      <div className={styles.para}>祖国</div>
    </div>
  )
}
```

```scss
// css
.box {
  .text {
    margin: 100px;
  }
  .para {
    color: red;
  }
}
```

## 3.计算功能

```scss
$var: 0.1;

.box {
  width: $var * 8rem;
  margin: $var + 0.3rem;
}

// 编译成
.box {
  width: 0.8rem;
  margin: 0.4rem;
}
```

## 4. 属性嵌套

注意下面的 border 后面要加个冒号。

```scss
.box {
  border: {
    width: 1px;
    style: solid;
    color: red;
  }
}

// 会变编译成
.box {
  border-width: 1px;
  border-style: solid;
  border-color: red;
}
```

属性嵌套, 对于单独设置的子属性， 提供一种简写方式:

```scss
.box {
  border: 1px solid #ccc {
    /* 单独设置的 子属性 */
    left: 0px;
    right: 0px;
  }
}

// 会变编译成
.box {
  border: 1px solid #ccc;
  border-left: 0px;
  border-right: 0px;
}
```

## 5. 代码的重用

### 1. 继承

使用 @extend 继承一个 class

```scss
.highlight {
  color: red;
}

.box {
  font-size: 30px;
  @extend .highlight;
}

// 编译成
.box {
  font-size: 12px;
  color: red;
}
```

### 2. Mixin

使用 @mixin 来定义一个代码块, 使用 @include 来调用这个代码块。

PS: 大家可以对比 extend 的方式

```scss
@mixin highlight {
  color: red;
}

.box {
  font-size: 30px;
  @include highlight;
}

// 编译成
.box {
  font-size: 30px;
  color: red;
}
```

mixin 还可以指定参数和缺省值，像函数一样进行调用:

```scss
@mixin highlight($val: red) {
  color: $val;
}

.box {
  font-size: 30px;
  @include highlight(blue);
}

// 编译成
.box {
  font-size: 30px;
  color: blue;
}
```

## 6. 高级语法

### 字符串分割的功能

```scss
@function str-split($str, $sep) {
  $arr: ();
  $index: str-index($str, $sep);
  @while $index != null {
    $item: str-slice($str, 1, $index - 1);
    $arr: append($arr, $item);
    $str: str-slice($str, $index + str-length($sep));
    $index: str-index($str, $sep);
  }
  $arr: append($arr, $str);
  @return $arr;
}
```

示例用法, `$my-array` 将会是 `("apple", "banana", "cherry")`

```scss
$my-string: 'apple,banana,cherry';
$my-array: str-split($my-string, ',');
```

定义一个代码块 `mixinBorderCorder`, 里面调用了 `str-split` 代码块:

```scss
@mixin mixinBorderCorder($config: ()) {
  $width: map-get($config, 'width');
  $height: map-get($config, 'height');
  $size: map-get($config, 'size');
  $color: map-get($config, 'color');
  $direction: map-get($config, 'direction');
  $direction-parts: str-split($direction, '-');
  $dirLeft: nth($direction-parts, 1);
  $dirRight: nth($direction-parts, 2);

  #{$dirLeft}: 0;
  border-#{$dirLeft}: $size solid $color;

  #{$dirRight}: 0;
  border-#{$dirRight}: $size solid $color;

  width: $width;
  height: $height;
}
```

调用代码块 `mixinBorderCorder`:

```scss
.div {
  @include mixinBorderCorder(
    (
      'width': 100px,
      'height': 200px,
      'size': 2px,
      'color': red,
      'direction': 'left-right'
    )
  );
}
```

等价于:

```css
.div {
  left: 0;
  border-left: 2px solid red;
  right: 0;
  border-right: 2px solid red;
  width: 100px;
  height: 200px;
}
```
