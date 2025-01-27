# CSS BEM

BEM 是一种命名约定，用于组织和命名 CSS 类名，使代码更加清晰、模块化和可维护。

BEM 是 `Block、Element、Modifier` 的缩写，其核心理念是将 UI 分解为独立的块 (`Block`)，每个块可以包含元素 (`Element`) 和修饰符 (`Modifier`)。

### BEM 命名规则

- **Block (块)** : 独立的功能性组件或模块。例如：`menu`、`button`。
- **Element (元素)** : 块的一部分，用双下划线 (`__`) 与块名连接。例如：`menu__item`、`button__icon`。
- **Modifier (修饰符)** : 描述块或元素的变体，用双连字符 (`--`) 与块名或元素名连接。例如：`menu--dark`、`button__icon--small`。

### 优点

- **可读性高**：通过类名即可了解结构和用途。
- **模块化**：样式的作用范围限定在块内，避免全局污染。
- **易扩展**：通过添加修饰符可以轻松扩展样式。

### 示例

一个导航菜单的 HTML 和 CSS，使用 BEM 命名规则：

#### HTML

```html
<nav class="menu">
  <ul class="menu__list">
    <li class="menu__item menu__item--active">
      <a href="#" class="menu__link">Home</a>
    </li>
    <li class="menu__item">
      <a href="#" class="menu__link">About</a>
    </li>
    <li class="menu__item">
      <a href="#" class="menu__link">Contact</a>
    </li>
  </ul>
</nav>
```

#### CSS

```css
/* Block */
.menu {
  background-color: #f0f0f0;
  padding: 10px;
}

/* Element */
.menu__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
}

.menu__item {
  margin-right: 20px;
}

.menu__link {
  text-decoration: none;
  color: #333;
}

/* Modifier */
.menu__item--active .menu__link {
  font-weight: bold;
  color: #007bff;
}
```



## `Element-plus` 源码也使用了 BEM

[`Element-plus`](https://github.com/element-plus/element-plus/blob/dev/packages/hooks/use-namespace/index.ts) 命名 CSS 也是使用这种规范:

简化后的源码实现如下：

```ts
<script lang="ts" setup>
const defaultNamespace = "el-"; // 全局名称
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

上面的代码最终转换成 `html` 结构如下：

```html
<div class="el-menu">
  <div class="el-menu__item is-active">
    <div class="el-menu__button--success">button</div>
  </div>
</div>
```

源码链接: <https://github.com/element-plus/element-plus/blob/dev/packages/hooks/use-namespace/index.ts>


### 总结

BEM 提供了一种结构化的 CSS 编写方式，非常适合大型项目和团队协作，能显著提高代码的可维护性和可读性。
