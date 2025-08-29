# Vue2 实践与问题集锦

## Vue2 的代码执行时机 - 1

- `Child.vue` 的 `mounted` 钩子不会等待 `created` 中的异步逻辑完成后再执行。
- `$emit` 触发是一个同步调用。
- 在监听 `num` 时，父组件的 watch 会先触发，子组件的 watch 随后才会触发。

最终输出顺序如下：

```
Parent watch num: 1
Child watch num: 1
Child mounted
Parent mounted

# 延迟 1 秒后
=== Child before created ===
Parent onHandle
=== Child after created ===
Parent watch num: 2
Child watch num: 2
```

`Parent.vue`:

```html
<template>
  <div>
    <p id="box">{{ num }}</p>
    <Count :num="num" @handle="onHandle" />
  </div>
</template>

<script>
  import Count from "./components/Child.vue";

  export default {
    components: {
      Count
    },
    watch: {
      num: {
        handler(data) {
          console.log("Parent watch num:", data);
        },
        immediate: true
      }
    },
    data() {
      return {
        num: 1
      };
    },
    methods: {
      onHandle(data) {
        this.num = data.num;
        console.log("Parent onHandle");
      }
    },
    mounted() {
      console.log("Parent mounted");
    }
  };
</script>
```

`Child.vue`:

```html
<template>
  <div></div>
</template>

<script>
  export default {
    props: {
      num: Number
    },
    watch: {
      num: {
        handler(val) {
          console.log("Child watch num:", val);
        },
        immediate: true
      }
    },
    async created() {
      await new Promise((r) => {
        setTimeout(r, 1000);
      });
      console.log("=== Child before created ===");
      this.$emit("handle", {
        num: 2
      });
      console.log("=== Child after created ===");
    },
    mounted() {
      console.log("Child mounted");
    }
  };
</script>
```

## Vue2 的代码执行时机 - 2

如果上面的代码把 `await new Promise(r => { setTimeout(r, 1000); });` 注释了，则输出：

```
Parent watch num: 1
Child watch num: 1
=== Child before created ===
Parent onHandle
=== Child after created ===
Child mounted
Parent mounted
Parent watch num: 2
Child watch num: 2
```

## $nextTick 更新时机

这个时候 `dom` 已经更新完毕。

## $forceUpdate 更新问题

`$forceUpdate` 会让当前组件强制重新渲染，如果传递给子组件的 props 没变，则不会强制刷新子组件。

## 先赋值再 $set 会无效

下面的代码先赋值 `this.obj.a = 1` 再 `$set` 时，内部判断发现属性已存在，只是 `set` 一下，不会再走 `defineReactive`，也不会替换 `getter/setter`。

```html
<template>
  <div id="app">
    <div>{{ obj.num }}</div>
    <button @click="handleClick">点击</button>
  </div>
</template>

<script>
  export default {
    name: "App",
    data() {
      return {
        obj: {}
      };
    },
    methods: {
      handleClick() {
        this.obj.num = 1;
        this.$set(this.obj, "num", 2);
      }
    }
  };
</script>
```

## Checkbox 的选中和反向选中

通过 computed set 属性反作用其它元素。

```html
<div id="app">
  <input type="checkbox" v-model="AllChecked" />
  <div><input type="checkbox" v-model="cks[0].status" />复选框1</div>
  <div><input type="checkbox" v-model="cks[1].status" />复选框2</div>
</div>
<script>
  var vm = new Vue({
    el: "#app",
    data: {
      cks: [{ status: false }, { status: false }]
    },
    computed: {
      AllChecked: {
        get() {
          return this.cks.every((item) => item.status);
        },
        set(value) {
          this.cks.forEach((item, index) => {
            this.cks[index].status = value;
          });
        }
      }
    }
  });
</script>
```

## Vue2 自定义 CtrlInput 组件

如何让 input 输入框只能输入数字?

### 1. 使用`v-model.number`

这是官方自带的方法:

```vue
<input v-model.number="val" type="number" />
```

### 2. 自定义 CtrlInputNumber 组件

#### 1. 封装 CtrlInput 组件

```vue
<template>
  <input v-bind="$attrs" ref="input" :value="value" v-on="inputListeners" />
</template>

<script>
export default {
  name: "CtrlInput",
  props: {
    value: {
      type: String
    }
  },
  computed: {
    inputListeners() {
      return {
        //从父级添加所有的监听器
        ...this.$listeners,
        // 然后我们添加自定义监听器
        // 这里确保组件配合 `v-model` 的工作
        input: (e) => {
          this.$emit("input", e.target.value);
          // 保证原生的input value 是可控的
          // ensure native input value is controlled
          this.$nextTick(this.setNativeInputValue);
        }
      };
    },
    nativeInputValue() {
      //将传入的值转为String,防止出错
      return this.value === null || this.value === undefined ? "" : String(this.value);
    }
  },
  methods: {
    setNativeInputValue() {
      // 将展示的原生的input value 和this中的input value保持一致
      const input = this.$refs.input;
      if (!input) return;
      if (input.value === this.nativeInputValue) return;
      input.value = this.nativeInputValue;
    }
  }
};
</script>
```

#### 2. 封装 CtrlInputNumber 组件

```vue
<template>
  <CtrlInput type="text" placeholder="请输入数字" :value="value" @input="handleInput"></CtrlInput>
</template>

<script>
import CtrlInput from "./CtrlInput";
export default {
  name: "CtrlInputNumber",
  components: {
    CtrlInput
  },
  data() {
    return {
      value: ""
    };
  },
  methods: {
    handleInput(v) {
      if (/^[0-9]*$/.test(v)) {
        this.value = v;
      }
    }
  }
};
</script>
```

#### 3. 代码执行解析

注意: 用户每次输入的时候, input 输入框里的值会马上变化, 即 `input.value` 的值会马上变化。

情况 1: 用户输入数字 9

1. input 输入框变成了 "9", 则`input.value`的值变成 "9"。
1. 执行 `this.$emit('input', e.target.value);`, 父组件执行 `this.value = v;`, 造成子组件的`this.value`发生了变化。
1. 触发 `this.nativeInputValue`发生变化。
1. 异步执行 `setNativeInputValue` 时, 走到这一句停止执行代码 `if (input.value === this.nativeInputValue) return;`

情况 2: 用户输入字母 a

1. input 输入框变成了 "a", 则`input.value`的值变成 "a"。
2. 执行 `this.$emit('input', e.target.value);`, 由于父组件的判断 `if (/^[0-9]*$/.test(v))`, 使 `this.value` 没有发生变化。
3. 异步执行 `setNativeInputValue`, 走到最后一步 `input.value = this.nativeInputValue;`, 最终让 `input.value` 的值变成之前的值。
