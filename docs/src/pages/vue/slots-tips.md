# 插槽技巧

## 插槽转发

假设我们有一个组件 `Com`, 显示效果和代码如下:

<img width="211" alt="image" src="https://github.com/user-attachments/assets/aeb9ae40-3d79-43ce-bbcf-bfa82b559c6e">

```vue
<script setup lang="ts">
import { Input, InputNumber } from "ant-design-vue";
import { AndroidOutlined, AppleOutlined, LeftOutlined, RightOutlined } from "@ant-design/icons-vue";
</script>

<template>
  <div class="grid w-[200px] gap-4">
    <Input>
      <template #prefix>
        <AndroidOutlined />
      </template>
      <template #addonAfter>
        <LeftOutlined />
      </template>
    </Input>
    <InputNumber>
      <template #prefix>
        <AppleOutlined />
      </template>
      <template #addonAfter>
        <RightOutlined />
      </template>
    </InputNumber>
  </div>
</template>
```

那如何封装这个组件, 让插槽里面的内容是通过外部传入的?

也就是具名插槽的名称 `#prefix` 和 `addonAfter`, 并且插槽的内容 `<AndroidOutlined />` 和 `<LeftOutlined />` 都是通过外部传入的，从而联想到可以使用 `v-for` 来循环一个 `template` 标签。

```vue
<script setup lang="ts">
import { Input, InputNumber, InputProps, InputNumberProps } from "ant-design-vue";
import { PropType } from "vue";

defineProps({
  inputSlots: {
    type: Object as PropType<InputProps>,
    default: () => ({})
  },
  numberSlots: {
    type: Object as PropType<InputNumberProps>,
    default: () => ({})
  }
});
</script>

<template>
  <div class="grid w-[200px] gap-4">
    <Input>
      <template v-for="(value, name) in inputSlots" #[name] :key="name">
        <slot :name="value" />
      </template>
    </Input>
    <InputNumber>
      <template v-for="(value, name) in numberSlots" #[name] :key="name">
        <slot :name="value" />
      </template>
    </InputNumber>
  </div>
</template>
```

怎么使用 `Com` 组件呢?

```vue
<script setup lang="ts">
import Com from "./components/Com.vue";
import { AndroidOutlined, AppleOutlined, LeftOutlined, RightOutlined } from "@ant-design/icons-vue";

const inputSlots = {
  prefix: "input_prefix",
  addonAfter: "input_addonAfter"
};
const numberSlots = {
  prefix: "number_prefix",
  addonAfter: "number_addonAfter"
};
</script>

<template>
  <Com v-bind="{ inputSlots, numberSlots }">
    <template #input_prefix>
      <AndroidOutlined />
    </template>
    <template #input_addonAfter>
      <LeftOutlined />
    </template>
    <template #number_prefix>
      <AppleOutlined />
    </template>
    <template #number_addonAfter>
      <RightOutlined />
    </template>
  </Com>
</template>
```
