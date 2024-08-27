# Javascript 写法

## while 简写循环

下面的代码输出 `1, 2, 3`

```js
var i = 0;
while (i++ < 3) {
	console.log(i);
}

// 相当于
var i = 0;
while (i < 3) {
	i++;
	console.log(i);
}
```
