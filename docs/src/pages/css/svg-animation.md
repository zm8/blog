# svg 动画

通过网站 <https://yqnn.github.io/svg-path-editor/> 可以画路径，然后根据这个路径来做动画。

<img width="323" alt="image" src="https://github.com/user-attachments/assets/9a2e0bb7-52f4-4427-9088-75bd3779ff53">

下面的 html 代码, 最终展示的效果是:

![1](https://github.com/user-attachments/assets/48a6e94c-e8aa-4704-835a-8bebc2c9ecef)

- `stroke-dasharray` 用来定义 dashed 样式。通过变化`stroke-dashoffset` 成不同的值来做动画。

- `offset-path` 用来定义物体的运动轨迹，设置成和 svg 的 path 一样，都是 `M125.69 0.44 L182.46 16.41 L0.23 113`。 通过变化 `offset-distance` 成不同的值来做动画。

- 由于 svg 的横坐标是向右的, 所以箭头方向也向右。如果箭头方向向上, 可以设置 `transform: rotate(90deg);` 来旋转箭头向右。

```html
<!DOCTYPE html>
<html>
  <head>
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      .container {
        position: relative;
        width: 182px;
        height: 182px;
        margin: 80px auto;
      }
      .svg {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
      }
      .svg path {
        animation: line-go 0.4s linear infinite;
        stroke: #1346bb;
        stroke-dasharray: 10 10; /* 定义 dashed 样式 */
        stroke-width: 4;
        fill: none;
      }
      @keyframes line-go {
        0% {
          stroke-dashoffset: 20; /* 等于 stroke-dashoffset 的2个值相加 */
        }
        100% {
          stroke-dashoffset: 0;
        }
      }
      .moving-element {
        background: url(./images/arrow.png) no-repeat 0 0 / contain;
        width: 45px;
        height: 30px;
        animation: arrow-go 4s linear infinite;
        opacity: 0;
        /* 如果箭头方向不是向右, 可以使用 rotate 来旋转调整方向 transform: rotate(90deg); */
        /* offset-path 和 svg 的一样 */
        offset-path: path("M125.69 0.44 L182.46 16.41 L0.23 113");
      }
      @keyframes arrow-go {
        0% {
          offset-distance: 0%;
          opacity: 0;
        }
        5% {
          offset-distance: 10%;
          opacity: 1;
        }
        90% {
          offset-distance: 90%;
          opacity: 1;
        }
        100% {
          offset-distance: 100%;
          opacity: 0;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <svg class="svg">
        <path class="path" d="M125.69 0.44 L182.46 16.41 L0.23 113" />
      </svg>
      <div class="moving-element"></div>
    </div>
  </body>
</html>
```
