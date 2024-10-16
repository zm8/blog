# 组件级别的权限控制

注意一下几点:

- 用户的拥有的权限是用数组存储的, 因为它有可能有`新增`,`删除`等多个权限。
- Admin 的权限, 需要转换成数组, 包含用户的所有权限，详情请看 `useAuthor.ts`。
- `Authority.vue` 组件支持传递`字符串`或`数组`权限, 并且支持作用域插槽, 把`updatePermission`传递给你, 让你自己判断展示。

`App.vue`

```vue
<script lang="ts" setup>
import { ref, watchEffect } from "vue";
import Authority from "./components/Authority.vue";
import useAuthor from "./hook/useAuthor";
const selected = ref("sys:user:admin");
const { updatePermission } = useAuthor();
watchEffect(() => {
  console.log(selected.value);
  updatePermission(selected.value);
});
</script>

<template>
  <div>
    <div class="flex">
      <div>切换用户角色:</div>
      <div>
        <select v-model="selected">
          <option value="sys:user:admin">admin</option>
          <option value="sys:user:add">新增</option>
          <option value="sys:user:view">查询</option>
          <option value="sys:user:update">修改</option>
        </select>
      </div>
    </div>
    <div class="mt-4 flex gap-5">
      <Authority>
        <template #default="{ userPermissions }">
          <button class="border px-2" :disabled="!userPermissions.includes('sys:user:add')">
            新增用户
          </button>
        </template>
      </Authority>
      <Authority permission="sys:user:view">
        <button class="border px-2">查询用户</button>
      </Authority>
      <Authority :permission="['sys:user:update']">
        <button class="border px-2">修改用户</button>
      </Authority>
    </div>
  </div>
</template>
```

`Authority.vue`

```vue
<script setup lang="ts">
import { computed } from "vue";
import useAuthor from "../hook/useAuthor";

const props = defineProps<{
  permission?: string | string[];
}>();

const { permissions } = useAuthor();
const showSlot = computed(() => {
  if (!props.permission) return true; // 没有传入权限, 说明这个组件不需要权限, 直接显示
  if (!permissions) return false; // 用户没有权限
  if (Array.isArray(props.permission)) {
    return props.permission.every((item) => permissions.value.includes(item));
  } else {
    return permissions.value.includes(props.permission);
  }
});
</script>

<template>
  <slot v-if="showSlot" :userPermissions="permissions"></slot>
</template>
```

`useAuthor.ts`

```ts
import { ref } from "vue";

const permissions = ref<string[]>([]);
export default function useAuthor() {
  const updatePermission = (str: string) => {
    if (str === "sys:user:admin") {
      permissions.value = ["sys:user:add", "sys:user:view", "sys:user:update"];
      return;
    }
    permissions.value = [str];
  };
  return {
    permissions,
    updatePermission
  };
}
```
