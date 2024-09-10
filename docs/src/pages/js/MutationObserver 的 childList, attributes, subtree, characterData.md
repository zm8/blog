# MutationObserver 的 childList, attributes, subtree, characterData

The options object must set at least one of 'attributes', 'characterData', or 'childList' to true.
observer 设置属性值的时候, 至少 'attributes', 'characterData' 或 'childList' 设置为 true

```html
<div class="content">
  <div class="child">
    <div class="decendent">我们都是好孩子</div>
  </div>
</div>

<script>
  const observer = new MutationObserver(() => {
    console.log('变化了!')
  })
  const content = document.querySelector('.content')
  observer.observe(content, {
    childList: true, // 直接子节点的变动（新增、删除或者更改）, 不包括子孙节点, 除非加了 subtree 为true
    attributes: true, // 直接子节点的属性的变动
    subtree: true, // 是否将观察器应用于该节点的所有后代节点
    characterData: true // 节点内容或节点文本的变动
  })
</script>
```

### 1. childList:true

直接子节点的变动（新增、删除或者更改）, 不包括子孙节点, 除非加了 subtree 为 true

```js
// 能监测
document.querySelector('.child').remove()

// 不能监测, 因为不是直接子节点
document.querySelector('.decendent').remove()
```

### 2. subtree: true, childList: true

```js
// 孩子 和 子孙节点 都能监测到
document.querySelector('.child').remove()
document.querySelector('.decendent').remove()
```

### 3. attributes:true, subtree: true, childList: true

```js
// attributes: true, 能监测到;  attributes: false, 监测不到
document.querySelector('.content').setAttribute('data-test', '1')
```

### 4.characterData: true, childList: true, subtree: true

Set to true to monitor the specified target node (and, if subtree is true, its descendants) for changes to the character data contained within the node or nodes.
characterData 设置, 依赖 subtree 为 true

1. 当设置 characterData: true，如果直接通过 Chrome Dev 工具去改文案 "我们都是好孩子", 会监听到。
2. 而通过脚本去改变内容，就算 characterData 设置为 false, 也能监测到。

```js
document.querySelector('.decendent').innerHTML = 'abc'
```

::: 参考地址
https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver/observe
:::
