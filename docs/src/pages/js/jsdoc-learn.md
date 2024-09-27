# JS 文档注释

## 示例 1

```js
/**
 * 函数防抖
 * @author David<280541464@qq.com>
 * @license Apache-2.0
 * @param {Function} func 目标函数
 * @param {number} [duration] 延迟执行的时间, 默认1秒
 * @return {Function} 防抖的函数
 */
function debounce(func, duration = 1000) {}
```

## 示例 2

```js
/**
 * 获取指定范围内的随机数
 * @param {number} min 随机数的最小值
 * @param {number} max 随机数的最大值
 * @return {number} 随机数
 * @example
 * getRandom(1, 10); // 获取[1, 10]之间的随机整数
 */
function getRandom(min, max) {}
```

## 示例 3

```js
/**
 * 网络请求
 * @param {object} options 配置对象
 * @param {string} options.url 请求地址
 * @param {'GET'|'POST'} options.method 请求方法
 */
async function request(options) {}
```
