# 汉诺塔问题

一共有 3 个柱子，目标是从 A 移动到 C;

![image](https://user-images.githubusercontent.com/32337542/59562689-47f5da00-9062-11e9-91f3-8a4bc470b673.png)

- 若 A 柱子只有 1 个盘子，则直接
  A -> C
- 若 A 柱子有 2 个盘子：
  A->B
  A->C
  B->C
- 若 A 柱子有 3 个盘子:
  A->C
  A->B
  C->B
  (把 n-1 个盘子移到 B 缓冲区)
  A->C
  (把 A 移动到 C)
  B->A
  B->C
  A->C
  (把缓冲区的盘子移动到 C);

所以说一共分 3 步:

- 把 n-1 号盘子移动到缓冲区
- 把 1 号从起点移到终点
- 然后把缓冲区的 n-1 号盘子也移到终点

写成 JS 代码是:

```javascript
var log = function (from, to) {
	let fromStr = from.toString();
	fromStr = `([${fromStr}])`;

	let toStr = to.toString();
	toStr = `([${toStr}])`;

	let item = from[from.length - 1];
	console.log(`Move ${item} from ${from.name}${fromStr} to ${to.name}${toStr}`);
};

var hanoi = function (n, from, buffer, to) {
	if (n === 1) {
		log(from, to);

		let item = from.pop();
		to.push(item);
	} else {
		hanoi(n - 1, from, to, buffer);
		hanoi(1, from, buffer, to);
		hanoi(n - 1, buffer, from, to);
	}
};

var A = [];
A.push(3);
A.push(2);
A.push(1);

A.name = "A";
var B = [];
B.name = "B";
var C = [];
C.name = "C";

hanoi(A.length, A, B, C);

/* log
      Move 1 from A([3,2,1]) to C([])
      Move 2 from A([3,2]) to B([])
      Move 1 from C([1]) to B([2])
      Move 3 from A([3]) to C([])
      Move 1 from B([2,1]) to A([])
      Move 2 from B([2]) to C([3])
      Move 1 from A([1]) to C([3,2])
    */
```
