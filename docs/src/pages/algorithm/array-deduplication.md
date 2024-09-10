# 数组去重

## 1. 使用 Set

```js
function uniq(arr) {
  // 或 return [...new Set(arr)]
  return Array.from(new Set(arr))
}
```

## 2. 使用 Map

```js
function uniq(arr) {
  const map = new Map()
  return arr.filter((item) => !map.get(item) && map.set(item, 1))
}
```

## 3. 使用一个新数组

```js
function uniq(arr) {
  const len = arr.length
  const res = []
  for (let i = 0; i < len; i++) {
    const item = arr[i]
    if (!res.includes(item)) {
      res.push(item)
    }
  }
  return res
}
```
