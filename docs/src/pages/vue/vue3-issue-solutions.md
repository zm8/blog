# Vue3 常见问题解决思路

## 1. 如何让 3 列 2 行的 grid 布局, 每一列的内容左对齐

根据列数进行分组, 算出每组 box 最宽度, 取最大值进行赋值

```vue
<script setup lang="ts">
import { useTemplateRefsList } from '@vueuse/core';

const props = withDefaults(defineProps<{
    col?: 2 | 3; // 列数
}>(), {
    col: 3
});

const groupByIndex = <T>(arr: T[], col:number): T[][] =>{
    const len = arr.length;
    const newArr: T[][] = [];
    for(let j = 0; j < len; j++){
        const r = j % col;
        if(!newArr[r]) = newArr[r] = [];
        newArr[r].push(arr[j])
    }
    return newArr;
}

const refsList = useTemplateRefsList<HTMLElement>();
const setEqualWidth = ()=>{
    const groupList = groupByIndex(refsList.value, props.col);
    for(let i = 0; i < groupList.length; i++){
        const items = groupList[i];
        const maxWidth = items.reduce((acc, el)=>{
            el.style.minWidth = "";
            const w = el.getBoundingClientRect().width;
            return w > acc ? w : acc;
        }, 0);
        if(items.length > 1){
            items.forEach(el=>el.style.minWidth = `${Math.ceil(maxWidth)}px`);
        }
    }
}

onMounted(()=>{
    setEqualWidth();
});

onUpdated(()=>{
    setEqualWidth();
});
</script>

<template>
  <div class="grid justify-center">
    <div :ref="refsList.set">
      <!-- ... -->
    </div>
  </div>
</template>
```
