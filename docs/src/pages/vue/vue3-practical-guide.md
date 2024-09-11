# Vue3 实践与问题集锦

## wach 监听对象和数组

下面的例子 `watch` 监听不到 arr 和 obj 的变化, 除非加上 `{ deep: true }`

```vue
<template>
  <div @click="arr.push({})">点击按钮</div>
  <div @click="obj.q = {}">点击按钮</div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
const arr = ref<any>([]);
const obj = ref<any>({});
watch(arr, () => {
  console.log("arr changed"); // 监听不到
});
watch(obj, () => {
  console.log("obj changed"); // 监听不到
});
</script>
```

但是如果是 `reactive` 创建的, 则它的响应式转换是“深层”的。
下面的例子都能监听的到 `arr` 和 `obj`。

```vue
<template>
  <div @click="arr.push({})">点击按钮</div>
  <div @click="obj.q = {}">点击按钮</div>
</template>

<script setup lang="ts">
import { reactive, watch } from "vue";
const arr = reactive<any>([]);
const obj = reactive<any>({});
watch(arr, () => {
  console.log("arr changed"); // 可以监听的到
});
watch(obj, () => {
  console.log("obj changed"); // 可以监听的到
});
</script>
```

## Vue3 如何定义泛型

使用类型断言 `as`

```vue
<script setup lang="ts" generic="T">
const props = defineProps<{ list: T[] }>();
const scrollList = ref<T[]>([]) as Ref<T[]>;
scrollList.value = [...props.list];
</script>
```

::: 参考地址
<https://github.com/vuejs/core/issues/2136>
:::

## defineModel 的值更新是异步的

如下代码, num 的值打印出来是 0，而不是 1。
而在组件内部自定义的 `const num = ref(0);`，值为 1。

```vue
// ComA.vue
<script setup lang="ts">
import { ref } from "vue";

const numM = defineModel<number>({ required: true });
const num = ref(0);

const foo = () => {
  numM.value++;
  console.log(numM.value); // 0

  num.value++;
  console.log(num.value); // 1
};
foo();
</script>
```

```vue
// App.vue
<template>
  <ComA v-model="num" />
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import ComA from "./components/ComA.vue";
const num = ref(0);
</script>
```

要获得最新的值, 得使用 `await nexttick()`

```vue
<script setup lang="ts">
import { nextTick } from "vue";
const numM = defineModel<number>({ required: true });

const foo = async () => {
  numM.value++;
  await nextTick();
  console.log(numModel.value); // 1
};
foo();
</script>
```

## `createSharedComposable` 包裹的 hook 必须有返回值

使用 `@vueuse/core` 中的 `createSharedComposable` 包裹 hook 时，必须返回一个值，否则将无法正常工作。

```ts
import { createSharedComposable } from "@vueuse/core";
import { ref } from "vue";
const useNumber = () => {
  const num = ref(0);
  // 必须要有 return
  return { num };
};
const useSharedNumber = createSharedComposable(useNumber);
```

这和它的源码实现有关系:

![createSharedComposable](https://github.com/user-attachments/assets/76326da6-46f7-4338-bdea-6c0a7d6405be)

如果没有返回值，那么`!state` 那一行不能进入。

## Vue3 报死循环(Maximum call stack size exceeded)错误

假设自定义了一个 Vue 组件, 名字叫 **Loading.vue**，然后组件里面的 template 引用了 `@element-plus/icons-vue` 的 `Loading` 图标，那么这时会抛出死循环错误: `Maximum call stack size exceeded`

所以建议自定义的组件名字最好不要和 `Element Plus` 里的组件的名字一样。

```vue
<template>
  <div>
    <el-icon><Loading /></el-icon>
  </div>
</template>
```

如果自定义的组件一定要用 `Loading.vue` 名字, 有个解决办法, script 里面显示的表明 Loading 组件是哪里 import 来的。

```vue
<script setup lang="ts">
import { Loading } from "@element-plus/icons-vue";
</script>
```

## reactive 重置初始化对象

由于 reactive 初始化的对象和原对象是共享同一个引用:

```js
const initState = { a: 1 };
const obj = reactive(initState);
obj.a = 10;
console.log(initState.a); // 也输出10
```

所以重置初始化对象的写法如下:

```js
const initialState = {
  count: 0
};
const state = reactive({ ...initialState });
const resetState = () => {
  Object.assign(state, initialState);
};
```

## watch 和 watchEffect 表现不一样

`watch` 1s 后会执行，而 `watchEffect` 则不行。

```js
const obj = reactive({ a: 1 });
watch(obj, () => {
  console.log(obj); // 会执行
});

watchEffect(() => {
  console.log(obj); // 不会执行
});

setTimeout(() => {
  obj.a = 10;
}, 1000);
```

要让 watchEffect 也能监听的到，得改成具体监听某个属性:

```js
watchEffect(() => {
  console.log(obj.a); // 会执行
});
```

## withDefaults 定义空对象和空数组

::: danger
使用 withDefaults 的时候, 空对象不能使用 Object, 空数组不能使用 Array。
:::

正确的定义方式如下：

```vue
<script setup lang="ts">
type Props = { a: number };
type EmptyObject = Record<string, never>;
withDefaults(defineProps<{ data?: Props | EmptyObject }>(), {
  data: () => ({})
});
</script>
```

```vue
<script setup lang="ts">
withDefaults(defineProps<{ data?: number[] }>(), {
  data: () => []
});
</script>
```

## Vue 使用 hook 和 React 的不同之处

假设都要使用 useWindowSize 的 hook， React 的写法和 vue 的写法不同之处如下:
Vue 监听的变化返回值, 必须**包在 computed** 里。

Vue 写法:

```js
const useGetRate = () => {
  const { width, height } = useWindowSize();
  return computed(() => (width.value > height.value ? width.value : height.value));
};
```

React 写法:

```js
const useGetRate = () => {
  const { width, height } = useWindowSize();
  return width.value > height.value ? width.value : height.value;
};
```

## Vue3.4 Props 解构不支持响应式

`App.vue` 组件:

```vue
<template>
  <Num :num="num" />
  <button type="button" @click="num += 1">Add</button>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Num from "./components/Num.vue";
const num = ref(0);
</script>
```

`Num.vue` 组件:

```vue
<template>
  <!-- 模版里的num, 支持响应式 -->
  <div>{{ num }}</div>

  <!-- Vue3.4 不支持响应式 -->
  <div>{{ numBig }}</div>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
const { num } = defineProps<{ num: number }>();
const numBig = computed(() => num * 10);

// 监听不到
watch(
  () => num,
  () => {
    console.log("change");
  }
);
</script>
```

### 解决方案

#### 1. 使用 props(推荐)

```vue
<script setup lang="ts">
import { computed, watch } from "vue";
const props = defineProps<{ num: number }>();
const numBig = computed(() => props.num * 10);
watch(
  () => props.num,
  () => {
    console.log("change");
  }
);
</script>
```

#### 2. 升级 Vue3.5(推荐)

```vue
<script setup lang="ts">
import { computed, watch } from "vue";
const { num } = defineProps<{ num: number }>();
const numBig = computed(() => num * 10);
watch(
  () => num,
  () => {
    console.log("change");
  }
);
</script>
```

#### 3. 使用 toRefs

```vue
<script setup lang="ts">
import { computed, toRefs, watch } from "vue";
const props = defineProps<{ num: number }>();
const { num } = toRefs(props);
const numBig = computed(() => num.value * 10);
watch(num, () => {
  console.log("change");
});
// 或者
watch(
  () => num.value,
  () => {
    console.log("change");
  }
);
</script>
```
