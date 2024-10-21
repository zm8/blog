# 动态表单的实现

## 1. 入口文件 `App.vue`

引入表单数据结构 `test1`, 渲染表单的组件 `FormItemComp`

```vue
<script lang="ts" setup>
import test1 from "./components/Form/FormPageDatas";
import FormItemComp from "./components/Form/FormItemComp.vue";
</script>

<template>
  <FormItemComp :formState="test1" />
</template>
```

## 2. 定义表单的数据结构 `Form/FormPageDatas.ts`

定义表单的类型和初始化的值, 并且通过函数, 知道下一个表单应该渲染什么组件。

```ts
import { createFormItem } from "./FormItem";

const test1 = createFormItem("input", { label: "test1", value: "" }, (current, acients) => {
  // 执行 next 的时候要知道所有的 current 和 acients
  console.log("item1 acients: ", acients);
  return current.payload.value === "test1" ? item2 : item3;
});

const item2 = createFormItem(
  "select",
  {
    label: "test2",
    options: [
      { label: "test2-1", value: "test2-1" },
      { label: "test2-2", value: "test2-2" },
      { label: "test2-3", value: "test2-3" }
    ],
    value: "test2-2"
  },
  (current, acients) => {
    console.log("item2 acients: ", acients);
    if (current.payload.value === "test2-2") {
      return item3;
    } else if (current.payload.value === "test2-3") {
      return item4;
    } else {
      return null;
    }
  }
);

const item3 = createFormItem(
  "checkbox",
  {
    label: "test3",
    options: [
      { label: "test3-1", value: "test3-1" },
      { label: "test3-2", value: "test3-2" },
      { label: "test3-3", value: "test3-3" }
    ],
    value: ["test3-1", "test3-3"]
  },
  (current, acients) => {
    console.log("item3 acients: ", acients);
    return current.payload.value.includes("test3-1") ? item4 : null;
  }
);

const item4 = createFormItem("radio", {
  label: "test4",
  options: [
    { label: "test4-1", value: "test4-1" },
    { label: "test4-2", value: "test4-2" },
    { label: "test4-3", value: "test4-3" }
  ],
  value: "test4-1"
});

export default test1;
```

## 3.`FormItem.ts`

定义了表单的 ts 类型, 和创建数据类型的方法 `createFormItem`

- 包装 next 方法, 执行 next 的过程中, 把下一个表单的 parent 赋值给当前的表单。
- 对整个数据对象进行 `reactive`

```ts
import { isReactive, reactive } from "vue";

export type FormItemType = "input" | "select" | "checkbox" | "radio";

export interface FormItem {
  type: FormItemType;
  payload: any;
  next: (current: FormItem, ancient: FormItem[]) => FormItem | null;
  parent: FormItem | null;
}

export function createFormItem(
  formItemType: FormItem["type"],
  payload: FormItem["payload"],
  next?: FormItem["next"],
  parent?: FormItem["parent"]
): FormItem {
  if (!next) {
    next = () => null;
  }
  if (!parent) {
    parent = null;
  }
  const nextFunc: FormItem["next"] = (current, acients) => {
    let nextItem = next!(current, acients);
    if (!nextItem) return null;
    nextItem.parent = current; // 当前表单执行 next 的时候, 把下个表单的 parent 赋值给当前表单
    if (!isReactive(nextItem)) {
      nextItem = reactive(nextItem);
    }
    return nextItem;
  };
  const formItem: FormItem = reactive({
    type: formItemType,
    payload,
    next: nextFunc,
    parent
  });
  return formItem;
}
```

## 4.`Form/FormItemComp.vue`

根据不同的数据类型, 渲染不同的表单, 并且定义了 `getNext` 方法, 执行 `getNext` 方法的时候, 传递当前的表单的数据 和 它的祖先数据。

1.当前组件`<template></template>`渲染完的时候, 它已经知道它的 `parent` 组件是谁了。

2.当再执行 `getNext()` 时, 根据它的 parent, 就能算出 acients, 再传入 `props.formState!.next` 方法。

```vue
<script setup lang="ts">
import { FormItem } from "./FormItem";

const props = defineProps<{ formState: FormItem | null }>();

function getNext(): FormItem | null {
  let current: FormItem | null = props.formState;
  if (!current) return null;
  const acients = [];
  acients.unshift(current);
  while ((current = current.parent)) {
    acients.unshift(current);
  }
  return props.formState!.next(props.formState!, acients);
}
</script>

<template>
  <template v-if="formState">
    <div class="my-4 flex">
      <div class="mr-10">{{ formState.payload.label }}:</div>

      <template v-if="formState.type === 'input'">
        <input type="text" class="border" v-model="formState.payload.value" />
      </template>

      <template v-if="formState.type === 'select'">
        <select v-model="formState.payload.value">
          <option
            v-for="option in formState.payload.options"
            :value="option.value"
            :key="option.value"
          >
            {{ option.label }}
          </option>
        </select>
      </template>

      <template v-if="formState.type === 'checkbox'" v-for="option in formState.payload.options">
        <input type="checkbox" :value="option.value" v-model="formState.payload.value" />
        <label>{{ option.label }}</label>
      </template>

      <template v-if="formState.type === 'radio'" v-for="option in formState.payload.options">
        <input type="radio" :value="option.value" v-model="formState.payload.value" />
        <label>{{ option.label }}</label>
      </template>
    </div>
    <FormItemComp :formState="getNext()" />
  </template>
</template>
```
