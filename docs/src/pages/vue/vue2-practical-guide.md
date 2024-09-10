# Vue2 实践与问题集锦

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
