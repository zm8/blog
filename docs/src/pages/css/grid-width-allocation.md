# grid 中元素的实际宽度问题

先请看下面的代码:

```html
<style type="text/css">
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
  .grid > * {
    background-color: green;
    height: 100px;
  }
</style>
<div class="grid">
  <div>1</div>
  <div>2</div>
  <div>3</div>
  <div>4</div>
</div>
```

body 的宽度为 1440, 最终每个 div 的宽度是 `205.71`, 而不是 `200`, 那这多余出来的
`0.71` 是怎么计算的?

- **Grid Container 总宽度**: 你的 body 宽度是 1440px，因此 Grid 容器的总宽度也是
  1440px。

- **最小宽度 (200px)**: 每个网格项的最小宽度是 200px，这意味着如果可能，网格项的
  宽度不会小于 200px。

- **计算能够容纳的列数**: `Math.floor(1440 / 200) = 7列`

- **计算剩余空间**: `1440 - 7 x 200 = 40`

- **分配剩余空间**: `40 / 7 = 5.71`

- **每个网格项的最终宽度**: `200 + 5.71 = 205.71`
