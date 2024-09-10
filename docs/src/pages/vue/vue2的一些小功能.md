# vue2 的一些功能记录

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
    el: '#app',
    data: {
      cks: [{ status: false }, { status: false }]
    },
    computed: {
      AllChecked: {
        get() {
          return this.cks.every((item) => item.status)
        },
        set(value) {
          this.cks.forEach((item, index) => {
            this.cks[index].status = value
          })
        }
      }
    }
  })
</script>
```
