# Vue3 一些注意点记录

## Vue3 wach 监听

如果没有加 `deep: true`, 下面的例子点击按钮后，watch 回调函数执行不了。

```vue
<template>
  <div @click="arr.push(1)">点击按钮</div>
  <div @click="obj.a = {}">点击按钮</div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
const arr = ref<any>([])
const obj = ref<any>({ a: 1 })
watch(arr, () => {
  console.log('arr changed')
})
watch(obj, () => {
  console.log('obj changed')
})
</script>
```

## Vue3 定义泛型报错

报错信息: `不能将类型T 分配给类型 UnwrapRefSimple<T>`;

代码如下:

```vue
<script setup lang="ts" generic="T">
interface Props<T> {
  list: T[]
}
const props = defineProps<Props<T>>()
const { list } = toRefs(props)
const scrollList = ref<T[]>([])

// 下面这行 TS 有报错
scrollList.value = [...list]
</script>
```

解决方案:

```vue
const scrollList = ref<T[]>([]) as Ref<T[]>;
```

参考地址：
https://github.com/vuejs/core/issues/2136

## defineModel 的值更新是异步的

如下代码, num 的值打印出来是 0，而不是 1。
而在组件内部自定义的 `const num = ref(0);`，值为 1。

```vue
// ComA.vue
<script setup lang="ts">
import { ref } from 'vue'

const numM = defineModel<number>({ required: true })
const num = ref(0)

const foo = () => {
  numM.value++
  console.log(numM.value) // 0

  num.value++
  console.log(num.value) // 1
}
foo()
</script>
```

```vue
// App.vue
<template>
  <ComA v-model="num" />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import ComA from './components/ComA.vue'
const num = ref(0)
</script>
```

要获得最新的值，可能只能使用 `await nexttick()`

```vue
<script setup lang="ts">
import { nextTick } from 'vue'
const numM = defineModel<number>({ required: true })

const foo = async () => {
  numM.value++
  await nextTick()
  console.log(numModel.value) // 1
}
foo()
</script>
```

## createSharedComposable 包括的 hook 一定得有返回值

使用 `createSharedComposable` 包裹一个 hook 的时候, 一定要有返回值，否则会不起作用。

```ts
import { createSharedComposable } from '@vueuse/core'
import { ref } from 'vue'
const useNumber = () => {
  const num = ref(0)
  // 必须要有 return
  return { num }
}
const useSharedNumber = createSharedComposable(useNumber)
```

这和它的源码实现有关系:
<img width="580" alt="image" src="https://github.com/user-attachments/assets/76326da6-46f7-4338-bdea-6c0a7d6405be">
如果没有返回值，那么`!state` 那一行不能进入。

## Vue3 报死循环(Maximum call stack size exceeded)错误

假设自定义了一个 Vue 组件, 名字叫 **Loading.vue**，然后组件里面的 template 引用了 `@element-plus/icons-vue` 的 `Loading` 图标，那么这时会抛出死循环错误: Maximum call stack size exceeded。

所以建议自定义的组件名字最好不要和 `Element Plus` 里的组件的名字一样。

```vue
// 如果组件的名字叫 Loading.vue, 会抛出死循环错误。
<template>
  <div>
    <el-icon><Loading /></el-icon>
  </div>
</template>
```

如果自定义的组件一定要用 `Loading.vue` 名字, 有个解决办法, script 里面显示的表明 Loading 组件是哪里 import 来的。

```vue
<script setup lang="ts">
import { Loading } from '@element-plus/icons-vue'
</script>
```

## reactive 初始化对象的时候

使用 reactive 初始化对象的时候, 对象最好是 clone 一遍，否则对象和 reactive 就会绑定在一起。

```js
const initState = { a: 1 }
const obj = reactive(initState)
obj.a = 10
console.log(initState.a) // 也输出10
```

正确初始化的方式是:

```js
const obj = reactive({ ...initState })
```

所以应该这样写重置初始化对象的方式:

```js
// 定义初始状态
const initialState = {
  count: 0
}

// 使用 reactive 定义状态对象
const state = reactive({ ...initialState })

// 重置状态
const resetState = () => {
  Object.assign(state, initialState)
}
```

immer 的做法是不需要重新 clone 一遍:

```js
import { produce } from 'immer'
const obj = { a: 1 }
const nextState = produce(obj, (draft) => {
  draft.a = 2
})
console.log(obj.a, nextState.a) // 1, 2
```

## watch 和 watchEffect 表现不一样

`watch` 1s 后会执行，而 `watchEffect` 则不行。

```js
const obj = reactive({ a: 1 })
watch(obj, () => {
  console.log(obj) // 1s后 会执行
})

watchEffect(() => {
  console.log(obj) // 1s后 不会执行
})

setTimeout(() => {
  obj.a = 10
}, 1000)
```

要让 watchEffect 监听的到的话，得改成具体监听的某个属性:

```js
watchEffect(() => {
  console.log(obj.a) // 1s后 会执行
})
```

## withDefaults 定义空对象和空数组

注意: 使用 withDefaults 的时候, 空对象不能使用 Object, 空数组不能使用 Array。
正确的定义方法如下:

```vue
<script setup lang="ts">
type Props = { a: number }
type EmptyObject = Record<string, never>
const props = withDefaults(defineProps<{ data?: Props | EmptyObject }>(), {
  data: () => ({})
})
</script>
```

```vue
<script setup lang="ts">
type Props = { a: number }[]
const props = withDefaults(defineProps<{ data?: Props }>(), {
  data: () => []
})
</script>
```

## Vue 使用 hook 和 React 的不同处

假设都要使用 useWindowSize 的 hook， React 的写法和 vue 的写法不同之处如下:
Vue 要监听变化, 一定得在 **watchEffect** 里面, 而返回的值如果是响应式变化，则必须**包在 computed** 里面。

Vue 写法:

```js
const useGetRate = () => {
  const { width, height } = useWindowSize()
  watchEffect(() => {
    console.log(width, height)
  })
  return computed(() =>
    width.value > height.value ? width.value : height.value
  )
}
```

React 写法:

```js
const useGetRate = () => {
  const { width, height } = useWindowSize()
  console.log(width, height)
  return width.value > height.value ? width.value : height.value
}
```
