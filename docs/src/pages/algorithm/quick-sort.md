# 快速排序算法

- 数据集中，选择一个元素作为基准
- 小于基准的数都排在左边，大于基准的数都排在右边
- 对 “基准” 左边和右边的子集，不断的重复第一步和第二步，直到子集只剩下最后一个元素。

```javascript
// 快速排序代码
const quickSort = (arr) => {
	if (arr.length <= 1) {
		return arr;
	}
	const left = [];
	const right = [];
	const pivot = arr.splice(Math.floor(arr.length / 2), 1)[0];
	let len = arr.length;
	while (len--) {
		let item = arr[len];
		if (item <= pivot) {
			left.push(item);
		} else {
			right.push(item);
		}
	}
	return quickSort(left).concat([pivot], quickSort(right));
};

const arr = [2, 1, 5, 7, 20, -1];
quickSort(arr);
```
