# css BEN

## 什么是 BEM 命名规范

Bem 是块（block）、元素（element）、修饰符（modifier）的简写，由 Yandex 团队提出的一种前端 CSS 命名方法论。

BEM 命名约定的模式是：

```css
.block {
}

.block__element {
}

.block--modifier {
}
```

比如例子:

```html
<div class="article">
  <div class="article__body">
    <div class="tag"></div>
    <button class="article__button--primary"></button>
    <button class="article__button--success"></button>
  </div>
</div>
```

[`Element-plus`](https://github.com/element-plus/element-plus/blob/dev/packages/hooks/use-namespace/index.ts) 命名 CSS 也是使用这种规范:

```vue
<script lang="ts" setup>
const defaultNamespace = "ht-"; // 全局名称
const statePrefix = "is-"; // 状态前缀
const useNamespace = (name: string) => {
  const b = () => defaultNamespace + name;
  const e = (element: string) => b() + "__" + element;
  const m = (element: string, modifier: string) => e(element) + "--" + modifier;
  const is = (n: string, state: boolean) => (state ? `${statePrefix}${n}` : "");
  return { b, e, is, m };
};

const { b, e, is, m } = useNamespace("menu");
</script>
<template>
  <div :class="[b()]">
    <div :class="[e('item'), is('active', true)]">
      <div :class="m('button', 'success')">button</div>
    </div>
  </div>
</template>
```

上面的代码最终转换成:

```html
<div class="ht-menu">
  <div class="ht-menu__item is-active">
    <div class="ht-menu__button--success">button</div>
  </div>
</div>
```
