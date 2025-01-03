# SASS 里的模块化开发

## 一、背景

CSS 本身是自带模块分开发的。 比如我们使用 `@import` 指令，这个模块化是运行时的，就是浏览器运行出来过后，它能够识别这样的指令。并且去读取你这里传递的相应的 CSS 文件。

SASS 是编译时，SASS 不能直接运行，它需要编译成纯粹的 CSS 代码才能够运行。

:::tip

CSS `@import` 指令支持浏览器 `>= IE8`, `Chrome` 等, 浏览器兼容性还是比较好的。

:::

## 二、CSS 原生的模块化

新建 `index.html` 页面:

```html
<!DOCTYPE html>
<html lang="zh">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CSS 模块化</title>
    <link rel="stylesheet" href="./css/foo.css" />
  </head>
  <body>
    Hello World
  </body>
</html>
```

新建 `css/foo.css` 和 `css/common.css`:

```css
// foo.css
@import url("common.css");
```

```css
// common.css
body {
  font-size: 50px;
  color: red;
}
```

最终页面渲染出来:

<img width="294" alt="image" src="https://github.com/user-attachments/assets/e8d82e0b-6d38-4fa1-a034-101e32057cec" />

## 三、SASS 模块化

SASS 实现模块化的 2 种方法:

### 1. @import

#### 1.1 @import 运行时模块化

初始化文件 `package.json`, 并且安装 `sass` 依赖:

```
pnpm init
pnpm i sass -D
```

在 `package.json` 的 `scripts` 字段新增命令 `sass`:

```json
{
  "name": "sass_test",
  "version": "1.0.0",
  "scripts": {
    "sass": "sass --watch src/1.scss src/1.css --no-source-map"
  },
  "devDependencies": {
    "sass": "^1.82.0",
  }
}
```

新增文件 `src/1.scss`:

```css
@import url('abcdefg.css');
```

运行命令 `pnpm sass`, 可以看到生成了 `src/1.css` 内容如下:

``` css
@import url('abcdefg.css');
```

:::tip 提示
由于 SASS 它是运行时而不是编译时，哪怕写一个不存在的文件，它在编译过程也没有报错。
:::

#### 1.2 @import 编译时模块化

新建文件 `src/common.scss`:

```css
$color: red;

* {
  margin: 0;
  padding: 0;
}
```

新建文件 `src/foo.scss`:

``` css
@import "common.scss";

body {
  color: $color;
}
```

修改 `package.json` 命令行 `sass`:

``` json
{
  "name": "sass_test",
  "version": "1.0.0",
  "scripts": {
    "sass": "sass --watch src/foo.scss src/foo.css --no-source-map"
  },
  "devDependencies": {
    "sass": "^1.82.0",
  }
}
```

终端运行命令 `pnpm sass`, 最终生成了 `foo.css`:

``` css
* {
  margin: 0;
  padding: 0;
}

body {
  color: red;
}
```

### 2. @use

`sass` 官方不推荐使用 `import` 这种方式, 主要存在3个问题:

- 混淆: 因为 `import` 指令承担着2个作用，一个是运行时的 CSS 规则，一个是 SASS 的语法规则。
- 污染: 如果我导入了 2 个 CSS 模块, `@import 'common.scss'` 和 `@import 'var.scss'`, 那么在 `var.scss` 里面定义的变量会覆盖 `common.scss` 的变量。
- 无私有: 比如我在 `common.scss` 定了一个变量 `$jjj: 1`, 我希望着变量只在 `foo.scss` 里面使用，不希望暴露出去，但是并不行。

#### 2.1 @use 模块化 - 命名空间

把前面的 `foo.scss` 代码里的 `import` 改成 `use`, 代码如下:

```css
@use "common.scss";

body {
  color: $color;
  font-size: $size;
}
```

它会报错 `Error: Undefined variable.`，因为 `use` 指令会给每一个模块添加一个命名空间。

这个命名空间和模块的`文件名`是一样的，修改  `foo.scss` 如下, 就能编译成功了。

```scss
@use "common.scss";

body {
  color: common.$color;
  font-size: common.$size;
}
```

当然也可以自定义命名空间, 使用 `as` 关键字。

``` css
@use "common.scss" as aaa;

body {
  color: aaa.$color;
  font-size: aaa.$size;
}
```

它还支持命名空间是 `*`, 表示变量全局引用(不推荐)。

```scss
@use "common.scss" as *;

body {
  color: $color;
  font-size: $size;
}
```

#### 2.1 @use 模块化 - 私有

只要给变量名前面加一个 横杠`-` 或者 下划线`_`, 和 `js` 定义私有变量很像。

修改 `common.scss` 和 `foo.scss`

```scss
// common.scss
$_color: red;
```

```scss
// foo.scss
@use "common.scss" as aaa;

body {
  color: aaa.$_color;
}
```

执行命令 `pnpm sass`, 可以看到控制台报错, 私有成员不能被外部模块引用。说明 `$_color` 这个变量只能在 `common.scss` 里使用。

```
Error: Private members can't be accessed from outside their modules.
```