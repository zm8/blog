# Vue 组件编写的几种方式

## 1. SFC(Single-File Component)

单文件组件, 以 `*.vue` 作为文件扩展名, 是 Vue 官方推荐的方式。

特点: 模版和逻辑分离, 结构比较清晰。

`Test.vue` 代码如下:

```vue
<script setup lang="ts">
import { ref } from "vue";
defineProps<{
  text: string;
}>();

const num = ref(0);
</script>
<template>
  <div class="aaa">
    {{ text }}
    <div @click="num++">{{ num }}</div>
  </div>
</template>
```

## 2. 渲染函数(Render Functions)

Vue 提供了一个 `h()` 函数用于创建 `vnodes`。

特点: 需要引入 `h` 和 `defineComponent` 函数, 没有模版语法。

`Test.ts` 代码如下:

```ts
import { defineComponent, h, ref } from "vue";

export default defineComponent({
  props: {
    text: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const num = ref(0);
    return () =>
      h("div", { class: "aaa" }, [props.text, h("div", { onClick: () => num.value++ }, num.value)]);
  }
});
```

## 3. JSX / TSX

JSX 和 TSX 是 React 的语法扩展, Vue 也支持这种语法。

特点: 不需要引入 `h` 函数, 但是需要 `defineComponent` 定义组件。

`tsconfig.json` 需要配置:

```json
{
  "compilerOptions": {
    "jsx": "preserve",
    "jsxImportSource": "vue"
    // ...
  }
}
```

`vite.config.ts` 需要配置 `vueJsx` 插件:

```ts
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";

export default defineConfig({
  plugins: [vue(), vueJsx()]
  // ...
});
```

`Test.tsx` 代码如下:

```tsx
import { defineComponent, ref } from "vue";

export default defineComponent({
  props: {
    text: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const num = ref(0);
    return () => (
      <div class="aaa">
        {props.text}
        <div onClick={() => num.value++}>{num.value}</div>
      </div>
    );
  }
});
```

## 4. 函数式组件(Functional Components) -- 不推荐

一般不推荐使用, 因为 `ref` 只能写在函数外, 是一个全局共享状态。

特点: 不需要引入 `h` 和 `defineComponent`, 直接导出一个函数即可。

`Test.tsx` 代码如下:

```ts
import { ref, type FunctionalComponent } from "vue";

interface Props {
  text: string;
}

const num = ref(0);
export const TestFunctionalCom: FunctionalComponent<Props> = (props) => {
  return (
    <div class="aaa">
      {props.text}
      <div onClick={() => num.value++}>{num.value}</div>
    </div>
  );
};
```

:::tip 提示
更多详细内容可参考: [Vue 官方文档](https://vuejs.org/guide/extras/render-function.html)
:::
