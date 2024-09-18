# 正则表达式 -- 断言, 惰性, 贪婪

## 1. 断言

### 1. `^` 匹配开始的输入

### 2. `$` 匹配结尾的输入

### 3. `\b` 匹配文字边界, `\B` 匹配非文字边界

```js
var str = 'abcdefg'
str.replace(/\b/g, '8') // 输出 "8abcdefg8"
str.replace(/\B/g, '1') // 输出 "a1b1c1d1e1f1g"
```

### 4. 向前断言 `x(?=y)`

当 x 后面紧跟着 y 时, 匹配 x

```js
var str = 'xy123'
str.replace(/x(?=y)/, 'a') // 输出 ay123
str.replace(/x(?=t)/, 'a') // str 不变
```

### 5. 向前否定断言 `x(?!y)`

当 x 后面不紧跟着 y 时, 匹配 x

```js
var str = 'xz123'
str.replace(/x(?!y)/, 'a') // 输出 az123
str.replace(/x(?!z)/, 'a') // str 不变
```

### 6. 向后断言 `(?<=y)x`

当 x 前面紧跟着 y, 匹配 x

```js
var str = 'yx123'
str.replace(/(?<=y)x/, 'a') // 输出 ya123
str.replace(/(?<=z)x/, 'a') // str 不变
```

### 7. 向后否定断言 `(?<!y)x`

当 x 前面不紧跟着 y, 匹配 x

```js
var str = 'yx123'
str.replace(/(?<!z)x/, 'a') // 输出 ya123
str.replace(/(?<!y)x/, 'a') // str不变
```

### 8. 兼容性

注意 "向后断言,向后否定断言"的 **兼容性很差**, PC safari , IOS Mobile , IE 11 都不兼容。
并且只要这个正则一加入到代码里，就算放在函数里，**函数不调用**，整个页面都报错了。

```js
function foo() {
  var reg = /(?<!z)x/ // 造成页面整体 js 报错。
}
```

https://caniuse.com/?search=%3F%3C%3D
![image](https://user-images.githubusercontent.com/32337542/97840987-f82fb580-1d1f-11eb-9d24-ff79bd2d5b3f.png)

### 9. 示例

如何给一个字符增加千分号

```js
function numberWithCommas(x) {
  var parts = x.toString().split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return parts.join('.')
}

// 分析
'1234567'.replace(/\B/g, ',') // 输出1,2,3,4,5,6,7
'1234567'.replace(/\B(?=(\d{3})+)/g, ',') // 输出1,2,3,4,567
'1234567'.replace(/\B(?=(\d{3})+(?!\d))/g, ',') // 每3个数字, 并且匹配的字符最后不能为数字, 输出1,234,567
```

## 2. 惰性, 贪婪

首先一个例子

```js
var str = '<em>Hello World</em>'
str.replace(/<.+>/g, '8888') // 输出 8888
```

如果我们想匹配 `<em> 和 </em>`, 只需

```js
var str = '<em>Hello World</em>'
str.replace(/<.+?>/g, '8888') // 输出 8888Hello World8888
```

### 2. 总结

贪婪标识符 `+, ?, *, {n}, {n,}, {n,m}`, 惰性标识符 就是在所有的后面加一个 `?`

| 语法结构 | 语义解释                                                              |
| -------- | --------------------------------------------------------------------- |
| \*?      | 可以重复任意次，但是尽可能重复少的次数。                              |
| +?       | 可以重复 1 次或者任意多次，但是尽可能重复少的次数，不过最少次数是 1。 |
| ??       | 可以重复 0 次或 1 次，但尽可能少重复。                                |
| {n,m}?   | 可以重复 n 到 m 此，但尽可能少重复，最少匹配次数是 n。                |
| {n,}?    | 可以重复 n 次以上，但尽可能少重复，最少匹配 n 次。                    |

```js
// *?
'abc'.replace(/.*/, '1') //  1
'abc'.replace(/.*/g, '1') // 11,  为什么呢? 会多匹配a前面的\b
'abc'.replace(/^.*/g, '1') // 1
'abc'.replace(/.*?/, '1') //  1abc
'abc'.replace(/.*?/g, '1') // 1a1b1c1

// +?
'abc'.replace(/.+/, '1') //  1
'abc'.replace(/.+/g, '1') //  1
'abc'.replace(/.+?/, '1') //  1bc
'abc'.replace(/.+?/g, '1') //  111

// ??
'abc'.replace(/.?/, '1') //  1bc
'abc'.replace(/.?/g, '1') //  1111, 多了一个1
'abc'.replace(/^.?/g, '1') //  1bc
'abc'.replace(/.??/, '1') // 1abc
'abc'.replace(/^.??/, '1') // 1abc
'abc'.replace(/.??/g, '1') // 1a1b1c1

// {n,m}?
'abb'.replace(/ab{1,2}/, '1') // 1
'abb'.replace(/ab{1,2}?/, '1') // 1b

// {n,}?
'abb'.replace(/ab{1,}/, '1') // 1
'abb'.replace(/ab{1,}?/, '1') // 1b
```

::: 参考地址
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions/Assertions
https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions/Quantifiers
:::
