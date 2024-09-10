# Flex 知识点记录

## 1. 支持 gap 属性, 可用于增加项目之间的间隙

```html
<style type="text/css">
  .box {
    display: flex;
    border: 1px solid red;
    width: 600px;
    gap: 20px;
  }
  .box .item {
    border: 1px solid blue;
  }
</style>
<div class="box">
  <div class="item">aaa</div>
  <div class="item">bbb</div>
</div>
```

## 2. 如何均等分项目

除了设置 `flex-grow: 1` 之外, 还得设置 `flex-basic: 0`, 否则内容多的一项会挤兑到另外一项。

```html
<style type="text/css">
  .box {
    display: flex;
    border: 1px solid red;
    width: 300px;
  }
  .box .item {
    flex-grow: 1;
    flex-basis: 0;
    border: 1px solid blue;
  }

  /* 也可以简写成 */
  .box .item {
    flex: 1;
    /* 相当于 */
    flex-grow: 1;
    flex-shrink: 1;
    flex-basis: 0%;
  }
</style>
<div class="box">
  <div class="item">打发沙发上等分打发沙发上等分</div>
  <div class="item">bbb</div>
</div>
```

当然也可以简写成 `flex: 1`, 相当于 `flex-grow: 1; flex-shrink: 1; flex-basis: 0%;`

```html
<style type="text/css">
  .box .item {
    flex: 1;
  }
</style>
```
