# Leetcode 算法题

## 判断一个字符串是否为回文

反转字符串进行判断:

```js
const str = "abca";
const isPalindrome = (str: string) => {
  return str === str.split("").reverse().join("");
};
console.log(isPalindrome(str));
```

定义双指针，不断移动前后指针:

```js
const str = "aba";
const isPalindrome = (str) => {
  let i = 0;
  let j = str.length - 1;
  while (i < j) {
    if (str[i] !== str[j]) return false;
    i++;
    j--;
  }
  return true;
};
console.log(isPalindrome(str));
```

从中间劈开，判断左右 2 边的字符串是否相等。

```js
const isPalindrome = (str) => {
  const len = str.length;
  for (let i = 0; i < len / 2; i++) {
    if (str[i] !== str[len - 1 - i]) return false;
  }
  return true;
};
```

## 删除一个字符，判断是否为回文字符串

描述:

```
示例 1: 输入: "aba"
输出: True
示例 2:
输入: "abca"
输出: True
解释: 你可以删除c字符。
注意: 字符串只包含从 a-z 的小写字母。字符串的最大长度是50000。
```

利用头尾双指针移动，判断是否为回文字符串。

```js
const str = "abca"; // 删除b或者删除c, 那么是回文字符串
const str2 = "abdca"; // 不是回文字符串

const validPalindrome = function (str) {
  const len = str.length;
  let i = 0; // 头部指针
  let j = len - 1; // 尾部指针
  // 如果 i比j 小, 或者 他们的值相等, 则继续移动
  while (i < j && str[i] === str[j]) {
    i++;
    j--;
  }

  // 判断 [left+1, right] 或者 [left, right+1] 是否为回文
  if (isPalindrome(i + 1, j)) return true;
  if (isPalindrome(i, j - 1)) return false;

  function isPalindrome(start, end) {
    while (start < end) {
      if (str[start] !== str[end]) return false;
      start++;
      end--;
    }
    return true;
  }

  return false;
};

console.log(validPalindrome(str));
console.log(validPalindrome(str2));
```

## [买卖股票的最佳时机](https://leetcode.cn/problems/best-time-to-buy-and-sell-stock/)

```js
示例 1：

输入：[7,1,5,3,6,4]
输出：5
解释：在第 2 天（股票价格 = 1）的时候买入，在第 5 天（股票价格 = 6）的时候卖出，最大利润 = 6-1 = 5 。
     注意利润不能是 7-1 = 6, 因为卖出价格需要大于买入价格；同时，你不能在买入前卖出股票。


示例 2：

输入：prices = [7,6,4,3,1]
输出：0
解释：在这种情况下, 没有交易完成, 所以最大利润为 0。
```

解题思路:

- 使用 1 个变量保存当前**最低价格**。
- 使用 1 个变量保存当前**最大利润**。
- 如果 下一项-当前的最低价格 > 保存的最大利润, 则返回最大利润。

```js
const prices = [7, 1, 6, 0, 7, 4];
var maxProfit = function (prices) {
  let maxProfit = 0;
  let historyMinPrice = Infinity;
  for (let i = 0; i < prices.length; i++) {
    if (prices[i] < historyMinPrice) {
      historyMinPrice = prices[i];
    }
    if (prices[i] - historyMinPrice > maxProfit) {
      maxProfit = prices[i] - historyMinPrice;
    }
  }
  return maxProfit;
};
console.log(maxProfit(prices));
```

如果买卖股票需要返回买入的时间 和 卖出的时间，则算法一样:

```js
const prices = [
  { date: "2023-3-1", value: 7 },
  { date: "2023-3-2", value: 1 },
  { date: "2023-3-3", value: 6 },
  { date: "2023-3-4", value: 0 },
  { date: "2023-3-5", value: 4 },
  { date: "2023-3-6", value: 4 }
];
const maxProfit = function (prices) {
  let maxProfit = 0;
  let historyMinPrice = { value: Infinity };
  let arrDate = [];
  for (let i = 0; i < prices.length; i++) {
    if (prices[i].value < historyMinPrice.value) {
      historyMinPrice = prices[i];
    }
    if (prices[i].value - historyMinPrice.value > maxProfit) {
      maxProfit = prices[i].value - historyMinPrice.value;
      arrDate = [historyMinPrice, prices[i]];
    }
  }
  return {
    maxProfit,
    arrDate
  };
};
console.log(maxProfit(prices));
/*
  {date: '2023-3-4', value: 0},
  {date: '2023-3-6', value: 7}
*/
```

## 数组转 map 或 obj 注意事项

算法题的解决思路，一般不会先将数组转成 map，然后再进行逻辑判断。
通常都是一边 map 存储，一遍逻辑判断。

数组转 map 或 obj 注意事项，不能用 item 当作 key，得用 index 当作 key，否则会出现丢失情况。
比如下面的情况:

```js
const arr = [3, 3];
const map = new Map();
arr.forEach((item, index) => {
  map.set(item, index);
});
console.log(map); // map 里只有 Map(1) {3 => 1}
```

所以得用 key 当 value，保证唯一性:

```js
const arr = [3, 3];
const map = new Map();
arr.forEach((item, index) => {
  map.set(index, item);
});
console.log(map); // map 里只有 Map(1) {0=>3, 1=>3}
```

## 字符串前面补 0

### 1. 使用原生的方法 padStart

```js
const padStart = (str, total) => str.padStart(total, "0");
padStart("aaa", 10);
```

### 2. 使用 Array 填充

```js
var padStart = (str, total) => {
  const len = str.length;
  const diff = total > len ? total - len : 0;
  return Array(diff).fill("0").join("") + str;
};
padStart("aaa", 10);
```

### 3. 字符串累加

```js
var padStart = (str, total) => {
  let len = str.length;
  while (len < total) {
    str = "0" + str;
    len++;
  }
  return str;
};
padStart("aaa", 10);
```

## 217. 存在重复元素

如果存在一值在数组中出现至少两次，函数返回 true 。如果数组中每个元素都不相同，则返回 false 。

```js
示例 1:

输入: [1,2,3,1]
输出: true

示例 2:

输入: [1,2,3,4]
输出: false
```

解法：通过 map 存储每一个数组的值，如果 map 里面有之前的值，则说明重复。

```js
const constainersDuplicate = function (nums) {
  const map = new Map();
  for (const num of nums) {
    if (nums.has(num)) {
      return true;
    } else {
      nums.set(num, 1);
    }
  }
  return false;
};
```

## 387. 字符串中的第一个唯一字符

给定一个字符串，找到它的第一个不重复的字符，并返回它的索引。如果不存在，则返回 -1。

```js
示例：

s = "leetcode"
返回 0

s = "loveleetcode"
返回 2

// 提示：你可以假定该字符串只包含小写字母
```

解题思路:

1. 遍历一次字符串，使用 map 存储每一个字符串 和 它出现的次数。
2. 再次遍历字符串，如果它出现的次数为 1，则返回它的索引。

```js
var firstUniqChar = function (str) {
  const map = new Map();
  for (const char of str) {
    const count = (map.get(char) || 0) + 1;
    map.set(char, count);
  }
  for (let i = 0; i < str.length; i++) {
    if (map.get(str[i]) === 1) return i;
  }
  return -1;
};
```

## 242. 有效的字母异位词

```js
示例 1:

输入: s = "anagram", t = "nagaram"
输出: true
示例 2:

输入: s = "rat", t = "car"
输出: false
```

解题：

1. 首先判断它们的长度是否相等，不相等，则返回 false。
2. 使用一个对象记录每一个字符出现的次数，对于 s 的每个字符都加 1，对于 t 的每个字符都减 1.

```js
const isAnagram = (s, t) => {
  const sLen = s.length;
  const tLen = t.length;
  if (sLen !== tLen) return false;
  const obj = {};
  for (let i = 0; i < sLen; i++) {
    obj[s[i]] = (obj[s[i]] || 0) + 1;
    obj[t[i]] = (obj[t[i]] || 0) - 1;
  }
  return Object.values(obj).every((item) => item === 0);
};
```

for 里面的循环可以改成

```js
for (let i = 0; i < sLen; i++) {
  const sCurrent = s[i];
  const tCurrent = t[i];
  obj[sCurrent] ? obj[sCurrent]++ : (obj[sCurrent] = 1);
  obj[tCurrent] ? obj[tCurrent]-- : (obj[tCurrent] = -1);
}
```

## 169. 多数元素

给定一个大小为 n 的数组，找到其中的多数元素。多数元素是指在数组中出现次数 大于`⌊ n/2 ⌋`的元素。

```
示例 1：

输入：[3,2,3]
输出：3
示例 2：

输入：[2,2,1,1,1,2,2]
输出：2
```

```js
/**
 * @param {number[]} nums
 * @return {number}
 */
var majorityElement = function (nums) {
  const len = nums.length;
  const time = Math.floor(len / 2);
  const map = {};
  for (const num of nums) {
    map[num] = (map[num] || 0) + 1;
    if (map[num] > time) return num;
  }
};
```

如果用 map 的话:

```js
/**
 * @param {number[]} nums
 * @return {number}
 */
var majorityElement = function (nums) {
  const len = nums.length;
  const time = Math.floor(len / 2);
  const map = new Map();
  for (const num of nums) {
    const val = map.has(num) ? map.get(num) + 1 : 1;
    // 或者
    // const val = (map.get(num) || 0) + 1;
    if (val > time) return num;
    map.set(num, val);
  }
};
```

## 只出现一次的数字

给定一个非空整数数组，除了某个元素只出现一次以外，其余每个元素均出现**两次**。找出那个只出现了**一次**的元素。

```js
示例 1:

输入: [2,2,1]
输出: 1
示例 2:

输入: [4,1,2,1,2]
输出: 4

```

```js
/**
 * @param {number[]} nums
 * @return {number}
 */
var singleNumber = function (nums) {
  const map = new Map();
  for (const num of nums) {
    const val = (map.get(num) || 0) + 1;
    map.set(num, val);
  }
  for (const [num, value] of map) {
    if (value === 1) return num;
  }
};
```

巧妙的算法是, 由于 其余每个元素都会出现**2 次**，可以使用异或运算符`(^)`

- 任何数和自己做异或运算，结果为 0，即 a^a=0。
- 任何数和 0 做异或运算，结果还是自己，即 a^0=a。
- 异或运算中，满足交换律和结合律，也就是 a^b^a=b^a^a=b^(a^a)=b^0=b

```js
2 ^ 2; // 0
2 ^ 0; // 2
2 ^ 3 ^ (2 === 2) ^ 2 ^ 3; // 3
```

```js
/**
 * @param {number[]} nums
 * @return {number}
 */
var singleNumber = function (nums) {
  let init = nums[0];
  for (let i = 1; i < nums.length; i++) {
    init ^= nums[i];
  }
  return init;
};
```

## 位 1 的个数

编写一个函数，输入是一个无符号整数（以二进制串的形式），返回其二进制表达式中数字位数为 '1' 的个数（也被称为汉明重量）。

```
示例 1：

输入：00000000000000000000000000001011
输出：3
解释：输入的二进制串 00000000000000000000000000001011 中，共有三位为 '1'。
示例 2：

输入：00000000000000000000000010000000
输出：1
解释：输入的二进制串 00000000000000000000000010000000 中，共有一位为 '1'。
```

首先 10 进制数转 2 进制数, 通过执行 `toString(2)`

```js
var n = 3;
n.toString(2); // 11
```

直接的实现方式:

```js
/**
 * @param {number} n - a positive integer
 * @return {number}
 */
var hammingWeight = function (n) {
  const binaryNum = n.toString(2); // 转换成二进制数
  let i = 0;
  for (const char of binaryNum) {
    if (char === "1") i++;
  }
  return i;
};
```

还有一种方式，使用二进制的按位与&，二进制的 2 个操作数都为 1 的情况下，值才为 1

```js
const a = 5; // 101
const b = 4; // 100

console.log(a & b); // 100 ===> 等于 4

const a = 7; // 111
const a = 6; // 110
console.log(a & b); // 110 ===> 等于 6
```

所以还有一种实现方式如下:

```js
var hammingWeight = function (n) {
  let ret = 0;
  while (n) {
    n &= n - 1;
    ret++;
  }
  return ret;
};
```

假设 n 为 6:

1. 第 1 次执行 6 & 5, 相当于二进制 '110' & '101' = '100'(十进制 4)，把 6 的最右侧的 1 变成 0 了
2. 第 2 次执行 4 & 3, 相当于二进制 '100' & '011' = 0，把 4 的最右侧的 1 变成 0 了
3. 所以最终 res 等于 2

## 两数之和

给定一个整数数组 nums 和一个整数目标值 target，请你在该数组中找出 和为目标值 target 的那 两个 整数，并返回它们的数组下标。

```js
示例 1：

输入：nums = [2,7,11,15], target = 9
输出：[0,1]
解释：因为 nums[0] + nums[1] == 9 ，返回 [0, 1] 。
示例 2：

输入：nums = [3,2,4], target = 6
输出：[1,2]
示例 3：

输入：nums = [3,3], target = 6
输出：[0,1]
```

解决方案, 先用 map 进行存储，然后再判断 `target - item` 是否在 map 里，

```js
var twoSum = function (nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const val = target - nums[i];
    if (map.has(val)) {
      return [map.get(val), i];
    } else {
      map.set(nums[i], i);
    }
  }
};
```

还有一种实现方式, map 存储的是差值:

```js
var twoSum = (nums, target) => {
  const map = new Map();
  for (let i = 0, len = nums.length; i < len; i++) {
    if (map.has(nums[i])) {
      return [map.get(nums[i]), i];
    } else {
      map.set(target - nums[i], i);
    }
  }
  return [];
};
```

## 快速排序算法

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

:::tip 参考地址
<https://juejin.cn/post/6987320619394138148>
:::
