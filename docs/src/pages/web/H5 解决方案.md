# H5 解决方案

## 1. ES 兼容性 API

手机端有的 API 会有兼容性问题，使用会造成页面白屏。所以都使用 lodash 替换。
替换的 API 有:

```js
    Object.values   ----- _.values
    Object.entries ----- _.entries
    [].flat -----  _.flatten 或 _.flattenDeep
    [].flatMap -----  _.flatMap
    Object.fromEntries ----  _.fromPairs
```

## 2. Date 兼容性问题

```js
var d = new Date('2018-09-20 19:20:32') // invalid date
alert(d.getTime())
// 必须改成
var d = new Date('2018/09/20 19:20:32')

// 而 moment 没有问题
moment('2018-09-20 10:58').valueOf()
```

## 3. 正则 "向后断言,向后否定断言" 兼容性问题

因为 js 会有一个预编译，所以就算下面 "函数" 不执行，在 PC safari , IOS Mobile , IE 11 都会报错白屏。
具体原因是 "向后断言,向后否定断言" 兼容性问题。

```js
function foo() {
  var reg = /(?<!z)x/
}
```

https://caniuse.com/?search=%3F%3C%3D
![image](https://user-images.githubusercontent.com/32337542/223664614-32cb0eee-8745-42ba-b44b-51d2a6e76498.png)
