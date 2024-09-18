# React Typescript 记录

## 扩展函数组件的静态类型

第 1 种方式，使用交叉类型:

```tsx
import { FC } from "react";
import Item from "./Item";

type Props = FC<{ num: number }> & {
  Item: typeof Item;
};
const List: Props = ({ num }) => {
  return <div>{num}</div>;
};
List.Item = Item;

export default List;
```

第 2 种方式, 不使用 FC, 直接定义 props 的类型:

```tsx
interface Props {
  num: number;
}

const List = ({ num }: Props) => {
  return <div>{num}</div>;
};
List.Item = Item;
```

鼠标移到 List 组件上，可以看到它的 ts 类型:
<img width="656" alt="image" src="https://github.com/zm8/blog_old/assets/32337542/62044d55-55a2-4186-afc3-bcb1e4d43bf6">

## 函数组件使用泛型

FC 不支持函数组件使用 泛型，所以推荐下面第 1 种写法。

### 第 1 种写法

```tsx
interface Props<T> {
  renderItem: (item: T) => ReactNode;
  items: T[];
}
const List = <T,>({ renderItem, items }: Props<T>) => {};
```

调用 <List /> 组件:

```tsx
<List
  items={[
    { title: "Hello", id: 1 },
    { title: "World", id: 2 }
  ]}
  renderItem={(item) => <li key={item.id}>{item.title}</li>}
/>
```

### 第 2 种写法

```tsx
const List: <T>(props: Props<T>) => React.ReactNode = ({ renderItem, items }) => { //... }
```

### function 形式

```tsx
function List<T>({ renderItem, items }: Props<T>) { //... }
```

总结: 平时我们写函数组件，喜欢使用 FC，其实也可以不使用。
