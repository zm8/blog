# 如何终止 promise

新建文件 `buildCancelableTask.ts`:

```ts
type Result<T> = {
  data: T | null;
  cancelled: boolean;
  error: null | Error;
};

const canceledError = new Error("cancelled");

const buildCancelableTask = <T>(asyncFn: () => Promise<T>) => {
  let rejected = false;
  const { promise, resolve } = Promise.withResolvers<Result<T>>();

  return {
    run: () => {
      if (!rejected) {
        asyncFn()
          .then((data) => resolve({ data, cancelled: false, error: null }))
          .catch((error: Error) => {
            const cancelled = error.me === canceledError;
            resolve({ data: null, cancelled, error: cancelled ? null : error });
          });
      }
      return promise;
    },
    cancel: () => {
      rejected = true;
      reject({ data: null, error: canceledError });
    }
  };
};

export default buildCancelableTask;
```

Vue3 封装成 `useSequentialAsyncFn.ts`:

```ts
import buildCancelableTask from "../ts/buildCancelableTask";

export default function useSequentialAsyncFn<Args extends unknown[], Data>(
  asyncFn: (...args: Args) => Promise<Data>
) {
  let ret: ReturnType<typeof buildCancelableTask>;
  return () => {
    ret && ret.cancel();
    ret = buildCancelableTask(asyncFn);
    return ret.run();
  };
}
```

使用

```vue
<script setup lang="ts">
import useSequentialAsyncFn from "./hook/useSequentialAsyncFn";

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

const run = useSequentialAsyncFn(async () => {
  await sleep(2 * 1000);
  return "Hello";
});

const onClick = async () => {
  const { cancelled, data } = await run();
  console.log("cancelled: ", cancelled);
  console.log("data: ", data);
};
</script>

<template>
  <div @click="onClick"></div>
</template>
```

另外 `promise-withresolvers.ts` 可以封装成一个 `polyfills`:

```ts
interface PromiseWithResolvers<T> {
  promise: Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
}

if (!Promise.withResolvers) {
  Promise.withResolvers = function <T>(): PromiseWithResolvers<T> {
    let resolve!: (value: T | PromiseLike<T>) => void;
    let reject!: (reason?: any) => void;
    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
}

// 为了让 TypeScript 认识这个新方法，我们需要扩展 Promise 的类型定义
declare global {
  interface PromiseConstructor {
    withResolvers<T>(): PromiseWithResolvers<T>;
  }
}

export {}; // 使这个文件成为一个模块
```

:::tip 参考地址
https://mp.weixin.qq.com/s/-KZmFC3IJO9LzrStStuqqw

:::
