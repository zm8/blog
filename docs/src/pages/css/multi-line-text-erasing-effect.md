# 多行文本擦除效果

什么样的动画是生效的? 一定是一个数值类的 css 属性才生效。
`--p: 0%` 百分比是数值, 但是它不是 css 属性, 它只是一个变量。

可以利用 `Houdini API`, 把它变成一个属性:

```vue
<template>
  <div class="container">
    <p>
      乌鸦想，把水瓶撞倒，就可以喝到水了。于是，它从高空往下冲，猛烈撞击水瓶。可是水瓶太重了，乌鸦用尽全身的力气，水瓶仍然纹丝不动。
      乌鸦一气之下，从不远处叼来一块石子，朝着水瓶砸下去。它本想把水瓶砸坏之后饮水，没想到石子不偏不倚，“扑通”一声正好落进了水瓶里。
      乌鸦飞下去，看到水瓶一点儿都没破。细心的乌鸦发现，石子沉入瓶底，里面的水好像比原来高了一些。
    </p>
    <p class="eraser">
      <span class="text">
        乌鸦想，把水瓶撞倒，就可以喝到水了。于是，它从高空往下冲，猛烈撞击水瓶。可是水瓶太重了，乌鸦用尽全身的力气，水瓶仍然纹丝不动。
        乌鸦一气之下，从不远处叼来一块石子，朝着水瓶砸下去。它本想把水瓶砸坏之后饮水，没想到石子不偏不倚，“扑通”一声正好落进了水瓶里。
        乌鸦飞下去，看到水瓶一点儿都没破。细心的乌鸦发现，石子沉入瓶底，里面的水好像比原来高了一些。
      </span>
    </p>
  </div>
</template>

<style scoped lang="scss">
:global(body) {
  background: #000;
  color: #fff;
}

.container {
  width: 80%;
  margin: 1em auto;
  position: relative;
  line-height: 2;
  text-indent: 2em;
}

.eraser {
  position: absolute;
  inset: 0;
}

.text {
  --p: 0%;
  background: linear-gradient(to right, #0000 var(--p), #000 calc(var(--p) + 30px));
  color: transparent;
  animation: eraser 5s linear forwards;
}

@property --p {
  syntax: "<percentage>";
  initial-value: 0%;
  inherits: false;
}

@keyframes eraser {
  to {
    --p: 100%;
  }
}
</style>
```
