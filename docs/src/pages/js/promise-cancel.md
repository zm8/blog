# 创建一个可以取消的 promise

## 1. 方式 1

使用 `Promise.withResolvers` 来实现。

```ts
type Result<T> = {
  readonly data?: T;
  readonly error?: Error;
  readonly cancelled: boolean;
};

type Service<T, K extends any[]> = (...params: K) => Promise<T> & {
  cancel: () => void;
};

const CANCELED_ERROR = Object.freeze(new Error("PROMISE_CANCELLED"));

const buildCancelableTask = <T, K extends any[]>(service: Service<T, K>) => {
  let isCancelled = false;
  let isCompleted = false;
  let servicePromise: ReturnType<Service<T, K>> | null = null;
  const { promise, resolve, reject } = Promise.withResolvers<T>();

  const run = (...params: K): Promise<Result<T>> => {
    if (!isCancelled) {
      servicePromise = service(...params);
      servicePromise.then((data) => resolve(data)).catch((error) => reject(error));
    }

    return promise
      .then((data) => ({
        data,
        cancelled: false
      }))
      .catch((error) => {
        const cancelled = error === CANCELED_ERROR;
        return {
          error: cancelled ? undefined : error,
          cancelled
        };
      })
      .finally(() => {
        isCompleted = true;
      });
  };

  const cancel = () => {
    if (isCompleted) return;
    isCancelled = true;
    reject(CANCELED_ERROR);
    servicePromise?.cancel();
  };

  const isCanceled = () => isCancelled;

  return { run, cancel, isCanceled };
};

export default buildCancelableTask;
```

Vue3 封装成 `useAsyncSequence.ts`:

```ts
import buildCancelableTask from "../ts/buildCancelableTask";

export default function useAsyncSequence<Args extends unknown[], Data>(
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
import useAsyncSequence from "./hook/useAsyncSequence";

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

const run = useAsyncSequence(async () => {
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

## 2. 方式 2

使用 `Promise.race` 来实现。

```ts
type PromiseWithCancel<TData> = Promise<{
  data?: TData;
  error?: Error;
  cancelled: boolean;
}> & {
  cancel: () => void;
};

export function getPromiseWithCancel<TData>(
  promiseFn: () => Promise<TData>
): PromiseWithCancel<TData> {
  let isCancelled = false;
  let cancel = () => {};

  const cancelPromise = new Promise<never>((_, reject) => {
    cancel = () => {
      isCancelled = true;
      reject(new Error("Promise cancelled"));
    };
  });

  const mainPromise = promiseFn().then((data) => {
    if (isCancelled) {
      throw new Error("Promise cancelled");
    }
    return { data, cancelled: false };
  });

  const resultPromise = Promise.race([mainPromise, cancelPromise]).catch((error) => ({
    error: isCancelled ? undefined : error,
    cancelled: isCancelled
  }));

  return Object.assign(resultPromise, { cancel });
}
```

调用例子:

```vue
<script setup lang="ts">
import { getPromiseWithCancel } from "./ts/getPromiseWithCancel";

const fn = async () => {
  const promise = getPromiseWithCancel(async () => {
    await new Promise((r) => setTimeout(r, 1000));
    return "data";
  });

  setTimeout(() => {
    promise.cancel();
  }, 100);

  // 或者等待结果
  const res = await promise;
  console.log(res.data, res.cancelled);
};
fn();
</script>
```

:::tip 参考地址

<https://mp.weixin.qq.com/s/36he_7HHuYNKyKS53B8nFQ>
<https://mp.weixin.qq.com/s/-KZmFC3IJO9LzrStStuqqw>

:::
