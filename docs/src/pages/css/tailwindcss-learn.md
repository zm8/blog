# tailwindcss 学习

## 1.group

如下代码当 `.box` 元素 hover 的时候, 文字的颜色会改变。

```vue
<template>
  <div class="box border p-10">
    <p>Create a new project from a variety of starting templates.</p>
  </div>
</template>

<style scoped>
.box:hover p {
  color: red;
}
</style>
```

那么等价的 group 写法为:

```vue
<template>
  <div class="group border p-10">
    <p class="group-hover:text-red-600">
      Create a new project from a variety of starting templates.
    </p>
  </div>
</template>
```

## 2.nesting groups

如下 list 使用了嵌套的 group, `group/item` 和 `group-hover/item`, `group/edit` 和 `group-hover/edit`。
`item` 和 `edit` 名字可以取任意的。

```vue
<script setup lang="ts">
import { ref } from "vue";

const list = ref([
  {
    name: "Leslie Abbott",
    title: "Co-Founder / CEO"
  },
  {
    name: "Hector Adams",
    title: "VP, Marketing"
  },
  {
    name: "Blake Alexander",
    title: "Account Coordinator"
  }
]);
</script>

<template>
  <ul class="block w-[500px] rounded border">
    <li class="group/item my-10 border" v-for="(item, index) in list" :key="index">
      <div>{{ item.name }}</div>
      <div>{{ item.title }}</div>
      <a class="group/edit invisible group-hover/item:visible" href="#">
        <span class="group-hover/edit:text-red-700">Call</span>
      </a>
    </li>
  </ul>
</template>
```

## 3.arbitrary groups - 任意分组

1.`published` 默认隐藏, 当 group 元素有 class `is-published`, 那么它就会显示。

```vue
<template>
  <div class="is-published group">
    <div>啊啊啊</div>
    <div class="hidden group-[.is-published]:block">Published</div>
  </div>
</template>
```

相当于平时写的 css 代码:

```vue
<template>
  <div class="box is-published">
    <div>啊啊啊</div>
    <div class="cnt">Published</div>
  </div>
</template>

<style scoped>
.cnt {
  visibility: hidden;
}
.box.is-published .cnt {
  visibility: visible;
}
</style>
```

或者使用 `scss` 的嵌套语法, 下面代码使用了 `scss` 的父选择器 `&`, 表示 `.cnt` 本身

```vue
<style scoped>
.cnt {
  visibility: hidden;
  .box.is-published & {
    visibility: visible;
  }
}
</style>
```

2.使用`&`来控制更加丰富的变体

下面代码最终显示效果为:

![image](https://github.com/user-attachments/assets/a0d1f0ad-dab1-44d8-ae9d-2ecdb2982545)

```vue
<template>
  <ul>
    <li class="group mb-4">
      <div class="hidden bg-gray-100 p-2 group-[&:nth-of-type(3)]:block">
        这是第 1 个项目的详细信息
      </div>
      <span>项目 1</span>
    </li>
    <li class="group mb-4">
      <div class="hidden bg-gray-100 p-2 group-[&:nth-of-type(3)]:block">
        这是第 2 个项目的详细信息
      </div>
      <span>项目 2</span>
    </li>
    <li class="group mb-4">
      <div class="hidden bg-gray-100 p-2 group-[&:nth-of-type(3)]:block">
        这是第 3 个项目的详细信息
      </div>
      <span>项目 3</span>
    </li>
    <li class="group mb-4">
      <div class="hidden bg-gray-100 p-2 group-[&:nth-of-type(3)]:block">
        这是第 4 个项目的详细信息
      </div>
      <span>项目 4</span>
    </li>
  </ul>
</template>
```

## Styling based on descendants (has-{modifier})

下面代码 p 默认都是隐藏, 只有包含了 a 的 group 里面的 p 是显示的

```html
<ul>
  <li class="group">
    <p class="hidden group-has-[a]:block">Sales</p>
  </li>
  <li class="group">
    <p class="hidden group-has-[a]:block">Marketing</p>
    <a href="#">link</a>
  </li>
  <li class="group">
    <p class="hidden group-has-[a]:block">SEO</p>
  </li>
</ul>
```
