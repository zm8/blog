# vue3 调用深层组件的方法

父组件如何调用子孙组件, 假设有下面 3 个组件:

- `ParentCom` 父组件
- `ChildCom` 子组件
- `GrandsonCom` 孙子组件

## 方法一

一层一层方法向上暴露。

1. `GrandsonCom` 组件

```vue
<script setup lang="ts">
import { ref } from "vue";

const num = ref(0);
const change = () => {
  num.value++;
};
defineExpose({
  change
});
</script>

<template>
  <div>{{ num }}</div>
</template>
```

2. `ChildCom` 组件

```vue
<script setup lang="ts">
import GrandsonCom from "./GrandsonCom.vue";
import { ref } from "vue";

const grandson = ref<InstanceType<typeof GrandsonCom>>();
defineExpose({
  change: () => grandson.value?.change()
});
</script>

<template>
  <GrandsonCom ref="grandson" />
</template>
```

3. `ParentCom` 组件

```vue
<script setup lang="ts">
import ChildCom from "./ChildCom.vue";
import { ref } from "vue";

const child = ref<InstanceType<typeof ChildCom>>();
</script>

<template>
  <ChildCom ref="child" />
  <button @click="child?.change">change</button>
</template>
```

## 方法二

通过注册组件的方式。

1. `GrandsonCom` 组件不变。

2. `ChildCom` 组件

:::tip 提示
`setRef` 的参数 el 类型只能设置为 `any`, 感觉这可能不是一种好方法。
:::

```vue
<script setup lang="ts">
import GrandsonCom from "./GrandsonCom.vue";

type GrandsonComInstance = InstanceType<typeof GrandsonCom>;

const emit = defineEmits<{
  (e: "register", el: GrandsonComInstance): void;
}>();

const setRef = (el: any) => {
  emit("register", el as GrandsonComInstance);
};
</script>

<template>
  <GrandsonCom :ref="setRef" />
</template>
```

3. `ParentCom` 组件

```vue
<script setup lang="ts">
import ChildCom from "./ChildCom.vue";
import GrandsonCom from "./GrandsonCom.vue";
import { ref } from "vue";

type GrandsonComInstance = InstanceType<typeof GrandsonCom>;

const child = ref<GrandsonComInstance>();
const register = (el: GrandsonComInstance) => {
  child.value = el;
};
const change = () => {
  child.value?.change();
};
</script>

<template>
  <ChildCom @register="register" />
  <button @click="change">change</button>
</template>
```

## 方法三

使用 `useRefExpose` hook 转发子组件的 ref。

`useRefExpose` 的实现:

```ts
import { Ref } from "vue";
import { ComponentPublicInstance } from "vue"; // 引入 Vue 实例类型

export function useRefExpose<T extends ComponentPublicInstance>(ref: Ref<T | undefined | null>) {
  return new Proxy<T>({} as T, {
    get(_target, prop) {
      return ref.value?.[prop as keyof T];
    },
    has(_target, prop) {
      return ref.value ? prop in ref.value : false;
    }
  });
}
```

1. `GrandsonCom` 组件不变。

2. `ChildCom` 组件

```vue
<script setup lang="ts">
import { ref } from "vue";
import GrandsonCom from "./GrandsonCom.vue";
import { useRefExpose } from "@/hooks/useRefExpose";

const childRef = ref<InstanceType<typeof GrandsonCom>>();

defineExpose(useRefExpose(childRef));
</script>

<template>
  <GrandsonCom ref="childRef" />
</template>
```

3. `ParentCom` 组件

```vue
<script setup lang="ts">
import ChildCom from "./ChildCom.vue";
import { ref } from "vue";

const childRef = ref<InstanceType<typeof ChildCom>>();
const change = () => {
  childRef.value?.change();
};
</script>

<template>
  <div class="border border-blue-500">
    <ChildCom ref="childRef" />
    <button @click="change">change</button>
  </div>
</template>
```
