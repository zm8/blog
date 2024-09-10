# Typescript 简单记录

### 1. 定义函数参考的默认值

```tsx
type Para = {
  a: number
  b: string
  c: boolean
}

export const fn = ({ a, b, c }: Para = { a: 1, b: '2', c: true }) => {
  console.log(a, b, c)
}
```
