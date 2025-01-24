# CSS 元素居中

页面的基本结构如下:

```html
<!DOCTYPE html>
<html lang="zh">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CSS元素垂直水平居中</title>
    <style>
      * {
        padding: 0;
        margin: 0;
        box-sizing: border-box;
      }
      .box {
        width: 200px;
        height: 200px;
        border: 1px solid red;
      }
      .child {
        width: 60px;
        height: 60px;
        background-color: blue;
      }
    </style>
  </head>
  <body>
    <div class="box">
      <div class="child"></div>
    </div>
  </body>
</html>
```

那么页面渲染如下:

![Image](https://github.com/user-attachments/assets/9087f567-9701-4e68-af15-f4abc5634de7)

共有 5 种方法实现水平居中。

![Image](https://github.com/user-attachments/assets/b7374f6b-f4f4-45ff-aee6-1c4cf57071f5)

## 1. flex

```css
.box {
  display: flex;
  justify-content: center;
  align-items: center;
}
```

## 2. flex 结合 margin:auto

```css
.box {
  display: flex;
}
.box .child {
  margin: auto;
}
```

## 3. Grid

```css
.box{
  display: grid;
  align-content: center;
  justify-content: center;
}
```

## 4. absolute 结合 transform

``` css
.box {
  position: relative;
}
.box .child {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
```

## 5. absolute 结合 margin auto

```css
.box {
  position: relative;
}
.box .child {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  margin: auto;
}
```
