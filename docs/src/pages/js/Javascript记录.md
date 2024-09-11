# Javascript 记录

## 滚动相关

### 1. 获取滚动条的高度

```js
var container = document.querySelector(".container");
var scrollbarHeight = container.scrollHeight - container.clientHeight;
```

### 2. 获取一个元素相对于其父级元素的高度

注意 container 必须设置 `relative` 才可以使用 `offsetTop`, 否则只能使用 `firstChild.getBoundingClientRect().top - container.getBoundingClientRect().top`

```js
var firstElementChild = document.querySelector(".content").firstElementChild;
firstElementChild.offsetTop;
```

### 3. 如果是向下滚动的话

那么最后一个元素是向下滚动 40px, 倒数第 2 个元素是向下滚动 80px;

```js
var lastElementChild = document.querySelector(".content").lastElementChild;
var container = document.querySelector(".container");
container.scrollHeight - lastElementChild.offsetTop;
```

html 代码如下:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>滚动示例</title>
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      .container {
        margin: 100px;
        width: 300px;
        height: 200px;
        overflow-y: scroll;
        border: 10px solid #000;
        position: relative;
      }
      .content {
      }
      .content div {
        height: 40px;
        border: 1px solid red;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="content">
        <div>1</div>
        <div>2</div>
        <div>3</div>
        <div>4</div>
        <div>5</div>
        <div>6</div>
        <div>7</div>
        <div>8</div>
        <div>9</div>
        <div>10</div>
      </div>
    </div>
  </body>
</html>
```

## 浏览器原生支持生成 UUID, `window.crypto.randomUUID()`

是一种用于生成随机 UUID（通用唯一标识符）的方法
兼容性表:

- Google Chrome: 支持 (自版本 92 起)
- Mozilla Firefox: 支持 (自版本 95 起)
- Safari: 支持 (自版本 15.4 起)
- Microsoft Edge: 支持 (自版本 92 起)
- Opera: 支持 (自版本 78 起)

```js
window.crypto.randomUUID(); //  '7e96031a-9db8-4f8f-aa6b-e55a8d374764'
```
