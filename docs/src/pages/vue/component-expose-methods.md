# 父组件调用子组件 expose 出来的方法

## 1. 直接遍历子组件实例上的属性, 赋值给 `defineExpose` 出来的对象

父组件:

```vue
<script setup lang="ts">
import { ref, onMounted } from "vue";
import SearchBar from "./components/SearchBar.vue";

const searchBarRef = ref<InstanceType<typeof SearchBar> | null>(null);
onMounted(() => {
  searchBarRef.value?.focus?.(); // 注意这里使用了 .focus?.()
});
</script>

<template>
  <SearchBar ref="searchBarRef" />
</template>
```

子组件:

```vue
<script setup lang="ts">
import { ElInput } from "element-plus";
import { ref, onMounted } from "vue";

type InstanceElInput = InstanceType<typeof ElInput>;
const inputRef = ref<InstanceElInput>();
const exposeObj: Partial<InstanceElInput> = {};

defineExpose(exposeObj);

onMounted(() => {
  Object.assign(exposeObj, inputRef.value);
});
</script>

<template>
  <div>
    <el-input ref="inputRef"></el-input>
  </div>
</template>
```

## 2. 使用 `useRefExpose` 钩子函数

子组件:

```vue
<script setup lang="ts">
import { useRefExpose } from "@/hooks/useRefExpose";
import { ElInput } from "element-plus";
import { ref } from "vue";
const inputRef = ref<InstanceType<typeof ElInput>>();

defineExpose(useRefExpose(inputRef));
</script>

<template>
  <div>
    <el-input ref="inputRef"></el-input>
  </div>
</template>
```
