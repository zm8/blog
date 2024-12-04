# Typescript 练习

## 1. 从字段到函数的推导

使用 `K` 拼接 `Changed` 的时候要注意, 对象的字段名不一定是字符串, 有可能是 `Symbol`, 所以需要使用 `string &` 来约束下

```ts
interface Watch<T> {
  on<K extends string & keyof T>(
    event: `${K}Changed`,
    callback: (oldValue: T[K], newValue: T[K]) => void
  ): void;
}

function watch<T>(obj: T): Watch<T> {
  console.log(obj);
  return {
    on: (event, callback) => {
      console.log(event, callback);
    }
  };
}

const personWatcher = watch({
  firstName: "David",
  lastName: "Zheng",
  age: 26
});

personWatcher.on("ageChanged", (oldValue, newValue) => {
  console.log(oldValue, newValue);
});
```

## 2. 使用 `infer` 提取函数的返回类型

```ts
type Return<T> = T extends (...args: any[]) => infer R ? R : T;

type sum = (a: number, b: number) => number;
type concat = (a: any[], b: any[]) => any[];

let sumResult: Return<sum> = 1;
let concatResult: Return<concat> = [1, 2, 3];
```

## 3. 使用 `infer` 提取函数的第一个参数类型

```ts
type FirstArg<T> = T extends (x: infer K, ...args: any[]) => void ? K : T;

type Fn = (name: string, age: number) => void;

type FirstArgType = FirstArg<Fn>; // string
```

## 4. 使用 `infer` 提取 Promise 里的泛型

```ts
type PromiseType<T> = T extends Promise<infer K> ? K : T;

type pt = PromiseType<Promise<string>>;
```

## 5. 使用 `infer` 提取数组类型

```ts
type ArrayType<T> = T extends (infer R)[] ? R : T;

type ItemType1 = ArrayType<[string, number]>; // string | number
type ItemType2 = ArrayType<string[]>; // string
```
