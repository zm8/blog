# Vue 面试

## 组件中 data 为什么是一个函数？

因为组件是用来复用的，且 JS 里对象是引用关系。

## vue 组件全局注册

### 1. vue2

使用 `Vue.component('component-a', { /* ... */ })`, 使用 webpack 的 `require.context` 解析目录进行全局注册。
参考地址: https://v2.cn.vuejs.org/v2/guide/components-registration.html#%E5%85%A8%E5%B1%80%E6%B3%A8%E5%86%8C

### 2. vue3

使用 app.component 的方法:

```vue
app .component('ComponentA', ComponentA) .component('ComponentB', ComponentB)
.component('ComponentC', ComponentC)
```

参考地址: https://cn.vuejs.org/guide/components/registration.html

## MVVM 的理解

MVVM 是 Model-View-ViewModel 的缩写。Model 层代表数据模型，View 代表 UI 组件，通过 ViewModel 把 Model 和 View 连接起来。

## Vue 实现双向数据绑定原理是什么？

Vue 的数据双向绑定整合了 Observer，Compile 和 Watcher 三者，通过 Observer 来监听自己的 model 的数据变化，通过 Compile 来解析编译模板指令，最终利用 Watcher 搭起 Observer 和 Compile 之间的通信桥梁，达到数据变化->视图更新，视图交互变化（例如 input 操作）->数据 model 变更的双向绑定效果。

## keep-alive 相关

### keep-alive 的实现原理是什么

keep-alive 在内部维护了一个 key 数组和一个缓存对象。具有两个生命周期钩子函数，分别是 activated 和 deactivated。

```js
// keep-alive 内部的声明周期函数
created () {
    this.cache = Object.create(null)
    this.keys = []
}
```

## nextTick 的作用是什么？他的实现原理是什么？

vue 的 Dom 的更新是异步的，数据更新，Dom 不会马上更新。
实现原理是分别判断: Promise, MutationObserver, setImmediate, setTimeout。

## Proxy 相比 defineProperty 的优势在哪里

1. `Object.defineProperty` 只能劫持对象属性的 getter 和 setter 方法。
2. `Object.definedProperty` 不支持数组的一些 api, 所以重写了数组方法。
3. Proxy 直接代理整个对象，也可以监听数组的变化，性能更好。

## 说一下 watch 与 computed 的区别是什么？以及他们的使用场景分别是什么？

- computed 有缓存，它依赖的值变了才会重新计算，watch 没有；
- watch 支持异步，computed 不支持；
- watch 监听某一个值变化，执行对应操作；computed 是监听属性依赖于其他属性。

API 的不同之处：
watch 的 参数：

- deep：深度监听
- immediate ：组件加载立即触发回调函数执行

computed 属性是函数时，都有 get 和 set 方法，默认走 get 方法，get 必须有返回值（return）

## vue 2 和 vue 3 的区别

1. 编译优化：vue2 通过标记静态根节点优化 diff，Vue3 标记和提升所有静态根节点，diff 的时候只需要对比动态节点内容

2. 生命周期
   vue3 使用 setup 代替了之前的 beforeCreate 和 created

3. vue3 支持 多根节点

4. Composition Api

5. vue3 Teleport 组件把 dom 移除到外面

6. 响应式原理
   vue3 使用 Proxy, vue2 使用 Object.defineProperty

7. 打包优化 tree-shaking
   挂载在 Vue 上的全局方法没有那么多

8. Typescript 支持

## vue 2.x 和 3.x diff 算法区别

vue2、vue3 的 diff 算法实现差异主要体现在：处理完首尾节点后，对剩余节点的处理方式。
vue2 是通过对旧节点列表建立一个 { key, oldVnode }的映射表，然后遍历新节点列表的剩余节点，根据 newVnode.key 在旧映射表中寻找可复用的节点，然后打补丁并且移动到正确的位置。
vue3 则是建立一个存储新节点数组中的剩余节点在旧节点数组上的索引的映射关系数组，建立完成这个数组后也即找到了可复用的节点，然后通过这个数组计算得到最长递增子序列，这个序列中的节点保持不动，然后将新节点数组中的剩余节点移动到正确的位置。

## vue 生命周期

对于 vue 来讲，生命周期就是一个 vue 实例从创建到销毁的过程。

### 1. beforeCreate：

new Vue( ) 之后触发的第一个钩子

### 2. created

实例已经创建完成，data 已经创建完成，但是获取不到 Dom。

### 3. beforeMount

发生在挂载之前，虚拟 Dom 已经渲染完成。

### 4. mounted

真实的 Dom 挂载完成，数据完成双向绑定，可以访问到 Dom 节点。

### 5. beforeUpdate

发生更新之前，虚拟 Dom 重新渲染。

### 6. updated

发生更新之后

### 7. beforeDestroy

实例销毁之前，清理一些副作用。

### 8. destroyed

实例销毁之后。

生命周期的调用顺序说一下:

1. 加载渲染过程：父 beforeCreate -> 父 created -> 父 beforeMount ---> 子 beforeCreate -> 子 created -> 子 beforeMount
   ---> 子 mounted->父 mounted

2. 子组件更新过程：父 beforeUpdate->子 beforeUpdate->子 updated->父 updated

3. 销毁过程：父 beforeDestroy->子 beforeDestroy->子 destroyed->父 destroyed

## 父组件可以监听到子组件的生命周期吗？

通过传递 mounted 属性，然后子组件挂载完成 $emit 触发。

```vue
// Parent.vue
<Child @mounted="doSomething" />

// Child.vue mounted() { this.$emit("mounted"); }
```

通过 @hook 来监听:

```vue
// Parent.vue
<Child @hook:mounted="doSomething"></Child>

doSomething() { console.log('父组件监听到 mounted 钩子函数 ...'); }, //
Child.vue mounted(){ console.log('子组件触发 mounted 钩子函数 ...'); }, //
以上输出顺序为： // 子组件触发 mounted 钩子函数 ... // 父组件监听到 mounted
钩子函数 ...
```

## Vue 实现双向数据绑定原理是什么？

Vue 的数据双向绑定整合了 Observer，Compile 和 Watcher 三者，通过 Observer 来监听自己的 model 的数据变化，通过 Compile 来解析编译模板指令，最终利用 Watcher 搭起 Observer 和 Compile 之间的通信桥梁，达到数据变化->视图更新，视图交互变化（例如 input 操作）->数据 model 变更的双向绑定效果。

## 如何实现 vue 项目中的性能优化？

vue 编码:

- 尽量减少数据的 data, 因为会增加 getter 和 setter, 收集对应的 watcher
- v-for 给每项元素绑定事件时使用事件代理
- SPA 页面采用 keep-alive 缓存组件
- 使用路由懒加载、异步组件

通用编码:

- 防抖，截流
- 第三方模块按需导入，比如 lodash 模块
- 长列表滚动到可视区域动态加载
- 图片懒加载

网络层面:

- cdn 加载
- 开启 gzip 压缩
- 设置 max-age 返回头
- 减少请求

代码层面:

- 骨架屏
- 懒加载，异步组件
- 使用事件代理，对于列表的绑定的事件
- 虚拟滚动
- 图片懒加载

## vue 首屏优化

hiper 来查看 DNS 解析，lighthouse 查看 FCP 白屏时间。

### 体积优化

- 分析 webpack bundle, 排查移除冗余资源

### 传输优化

- 托管 oss 和 cdn
- 开启 gzip 压缩
- http2
- 路由懒加载
- 合理的使用第三方的库，按需加载，减少打包体积。

### 感知优化

- 骨架加载
- 图片懒加载，使用占位图片

## 39. 说一下 vue 模版编译的原理是什么

parse: 接受 template，按着模版和数据生成对应的 ast
optimize: 遍历 ast 每一个节点，标记静态节点，diff 的时候 对比这部分 dom，提升性能。
generate 把前两步生成完善的 ast，转换成渲染函数。

## 如何监听 pushstate 和 replacestate 的变化呢？

重写 history 的 pushState 和 replaceStat。

```js
var _wr = function (type) {
  var orig = history[type]
  return function () {
    var rv = orig.apply(this, arguments)
    var e = new Event(type)
    e.arguments = arguments
    window.dispatchEvent(e)
    return rv
  }
}
history.pushState = _wr('pushState')
history.replaceState = _wr('replaceState')
```

## Vue2.x 中如何检测数组的变化

2 种方式不能修改。
直接赋值 和 修改数组长度。

```vue
<script>
export default {
  data() {
    return {
      list: [1, 2, 3]
    }
  },
  methods: {
    modify() {
      this.list[2] = 10 // 不生效
      this.$set(this.list, 2, 10) // 生效

      this.list.length = 2 // 不生效
      this.list.splice(2, 1) // 生效
    }
  }
}
</script>
```

## v-if 和 v-show 的区别

### v-show

1. 无论初始条件是什么，始终会被渲染。
2. 相当于设置 css 的 display 属性的显示(`display: block`)和隐藏(`display: none`)。

### v-if

1. 是惰性的，初始条件为 false，则不渲染。
2. 元素切换的时候事件监听器和子组件都会被销毁与重建。

## 组件之间的传递值

| 方式             | Vue2                                            | Vue3                  |
| ---------------- | ----------------------------------------------- | --------------------- |
| 父传子           | props                                           | props                 |
| 子传父           | $emit                                           | emits                 |
| 父传子           | $attrs(比如: id, title, 使用 v-bind="attrs")    | attrs                 |
| 子传父           | $listeners(比如: click, 使用 v-on="$listeners") | 无(合并到 attrs 方式) |
| 父传子           | provide                                         | provide               |
| 子传父           | inject                                          | inject                |
| 子组件访问父组件 | $parent                                         | 无                    |
| 父组件访问子组件 | $children                                       | 无                    |
| 父组件访问子组件 | $ref                                            | expose&ref            |
| 兄弟传值         | EventBus                                        | mitt                  |

## 3.插槽 Slots

一个简单的例子,
`<FancyButton>` 组件如此用:

```vue
<FancyButton>
  Click me! <!-- 插槽内容 -->
</FancyButton>
```

FancyButton 组件的模版是这样的:

```vue
<button class="fancy-btn">
  <slot></slot> <!-- 插槽出口 -->
</button>
```

最终渲染的 dom:

```vue
<button class="fancy-btn">Click me!</button>
```

#### 对比 React

相当于 react 里的 `props.children`
FancyButton 组件代码:

```jsx
function FancyButton(props) {
  ;<button class="fancy-btn">{props.children}</button>
}
```

### 使用场景 1 - layout 布局

```vue
<BaseLayout>
  <template #header> // 相当于 <template v-slot:header>
    <h1>Here might be a page title</h1>
  </template>
  <template #default>
    <p>A paragraph for the main content.</p>
    <p>And another one.</p>
  </template>
  <template #footer>
    <p>Here's some contact info</p>
  </template>
</BaseLayout>
```

BaseLayout 里面的写法:

```vue
<div class="container">
  <header>
    <slot name="header"></slot>
  </header>
  <main>
    <slot></slot>
  </main>
  <footer>
    <slot name="footer"></slot>
  </footer>
</div>
```

最终渲染的 dom:

```vue
<div class="container">
  <header>
    <h1>Here might be a page title</h1>
  </header>
  <main>
    <p>A paragraph for the main content.</p>
    <p>And another one.</p>
  </main>
  <footer>
    <p>Here's some contact info</p>
  </footer>
</div>
```

### 使用场景 2 - 渲染列表

渲染一个列表，数据进行远程加载，滚动分页等。但是列表的内容和样式留给它的父组件使用。

```vue
<FancyList :api-url="url" :per-page="10">
  <template #item="{ body, username, likes }">
    <div class="item">
      <p>{{ body }}</p>
      <p>by {{ username }} | {{ likes }} likes</p>
    </div>
  </template>
</FancyList>
```

<FancyList> 组件中:

```vue
<ul>
  <li v-for="item in items">
    <slot name="item" v-bind="item"></slot>
  </li>
</ul>
```

## v-model 实现原理

v-model 本质就是 :value + input 方法的语法糖。
以输入框为例，当用户在输入框输入内容时，会触发 input 事件，从而更新 value。而 value 的改变同样会更新视图，这就是 vue 中的双向绑定。

### 原生元素

```vue
<input v-model="msg" />

<checkbox v-model="msg" />

<select v-model="msg" />
```

会被编译成:

```vue
<input :value="msg" @input="msg = $event.target.value" />

<checkbox
  :checked="msg"
  @change="msg = $event.target.value"
  <select
  :value="msg"
  @change="msg = $event.target.value"
/>
```

### vue2 组件 v-model

### BaseInput 组件

组件的 v-model 会被编译成:

```vue
<BaseInput v-model="lovingVue" />
```

会被编译成:

```vue
<BaseInput :value="lovingVue" @input="lovingVue = $event" />
```

### BaseCheckbox 组件

```vue
<BaseCheckbox v-model="lovingVue" />
```

会被编译成:

```vue
<BaseCheckbox :checked="lovingVue" @change="lovingVue = $event" />
```

### BaseSelect 组件

```vue
<BaseSelect v-model="selected" :options="options" />

<script>
import BaseSelect from './components/BaseSelect.vue'

export default {
  //...
  data() {
    return {
      selected: 'A',
      options: [
        { text: 'One', value: 'A' },
        { text: 'Two', value: 'B' },
        { text: 'Three', value: 'C' }
      ]
    }
  }
}
</script>
```

会被编译成:

```vue
<BaseSelect :value="selected" @change="selected = $event" :options="options" />
```

### vue3 组件 v-model

[演练场: ](https://play.vuejs.org/#eNp9UttO4zAU/JUjCylF6jZa7T5VAe1FfdiVuAh4wzxE6WkxJLZlH4eiKP/OsV1KuT4lnhmPZ3w8iN/WzvqAYi4q3zhlCTxSsMdSq84aRzCAwxWMsHKmg4KlxY46efxr+E+jpi09K/ew6MtiAKkboz0BKWoRjqLhpOi/dWaJLdRuHbrogJu6sy0Wh1JXZc7CKXhByHhNyCuA6vb78TBsrcaxKnmd8P0wW+95Uh1Jkb5SQMnSqtz5ial4E/eDa1jiSmk8d8b6yXWRnIobzpjxRaco4sEu2TEfmOivKihtA8U/AHq0KSBuSIoMzfu6DXupM/orbWL0APnIyesDp3CAfaxAfJvITaLDYd76vjN5HsdKrWd33mhuPKQZiYYvQrXoziwpHpcUc0hM5Oq2NQ//E0Yu4PQZb26xuf8Av/ObiElx7tCj67nGjssZM724PE3NdyTPLcTSX5AX6E0bYsYs+xP0kmPv6VLaf+mNKr2+8osNofbPpWLQqByTXgoee3wDn1V/iftj9jPtk3oU4xOFJhgI)
参考地址: https://cn.vuejs.org/guide/components/v-model.html#component-v-model

```vue
<CustomInput v-model="searchText" />
```

相当于:

```vue
<CustomInput
  :model-value="searchText"
  @update:model-value="(newValue) => (searchText = newValue)"
/>
```

`<CustomInput>` 内部要做 2 件事:

1. 将 modelValue 绑定到 input 上
2. input 事件触发的时候要通知 `update:modelValue`

```vue
<!-- CustomInput.vue -->
<script>
export default {
  props: ['modelValue'],
  emits: ['update:modelValue']
}
</script>

<template>
  <input
    :value="modelValue"
    @input="$emit('update:modelValue', $event.target.value)"
  />
</template>
```

## 注意

vue3 使用一个组件有 2 种方式:

1.  组合式 `<script setup></script>`
2.  选项式`<script></script>`

```vue
<script setup>
import SlotAdvance from './components/SlotAdvance/SlotAdvance.vue'
</script>

<template>
  <SlotAdvance></SlotAdvance>
</template>
```

```vue
<script>
import SlotAdvance from './components/SlotAdvance/SlotAdvance.vue'
export default {
  components: {
    SlotAdvance
  }
}
</script>

<template>
  <SlotAdvance></SlotAdvance>
</template>
```

特别注意, 不能使用以下写法, 会报错，setup 里面不能再导出模块。
报错: `一个模块不能具有多个默认导出。ts(2528)`

```vue
<script setup>
import SlotAdvance from './components/SlotAdvance/SlotAdvance.vue'
export default {
  components: {
    SlotAdvance
  }
}
</script>
```
