# 架构篇-React 中的位运算及其应用

## 为什么要用位运算？

位运算就是直接对整数在内存中的二进制位进行操作。

比如:

- 0 在二进制中用 0 表示，我们用 0000 代表；
- 1 在二进制中用 1 表示，我们用 0001 代表；

如果一个值即代表 A 又代表 B 那么就可以通过位运算的 | 来处理。

```js
const A = 0b0000000000000000000000000000001
const B = 0b0000000000000000000000000000010
const C = 0b0000000000000000000000000000100
const N = 0b0000000000000000000000000000000
const value = A | B
console.log((value & A) !== N) // true
console.log((value & B) !== N) // true
console.log((value & C) !== N) // false
```

**位掩码**: 对于常量的声明（如上的 A B C ）必须满足只有**一个 1 位**，而且每一个常量**二进制 1 的所在位数**都不同，如下所示：

```
0b0000000000000000000000000000001 = 1
0b0000000000000000000000000000010 = 2
0b0000000000000000000000000000100 = 4
0b0000000000000000000000000001000 = 8
0b0000000000000000000000000010000 = 16
0b0000000000000000000000000100000 = 32
0b0000000000000000000000001000000 = 64
...
```

二进制 如果都是 2 的幂数，那么可以用这些变量来删除， 比较，合并这些常量。

## React 位掩码场景（1）—更新优先级

### 更新优先级

React 解决方案就是多个更新优先级的任务存在的时候，高优先级的任务会优先执行，等到执行完高优先级的任务，在回过头来执行低优先级的任务，这样保证了良好的用户体验。

在新版本 React 中，每一个更新中会把待更新的 fiber 增加了一个更新优先级，我们这里称之为 lane ，而且存在不同的更新优先级，这里枚举了一些优先级，如下所示：

```js
export const NoLanes = /*                        */ 0b0000000000000000000000000000000
const SyncLane = /*                        */ 0b0000000000000000000000000000001

const InputContinuousHydrationLane = /*    */ 0b0000000000000000000000000000010
const InputContinuousLane = /*             */ 0b0000000000000000000000000000100

const DefaultHydrationLane = /*            */ 0b0000000000000000000000000001000
const DefaultLane = /*                     */ 0b0000000000000000000000000010000

const TransitionHydrationLane = /*                */ 0b0000000000000000000000000100000
const TransitionLane = /*                        */ 0b0000000000000000000000001000000
```

lane 的代表的数值**越小**，此次更新的优先级就**越大**。
还有一个问题，React 在 render 阶段可能被中断，在这个期间会产生一个更高优先级的任务，那么会再次更新 lane 属性，这样多个更新就会合并，这样一个 **lane 可能需要表现出多个更新优先级。**

所以通过位运算，让多个**优先级的任务合并**，这样可以通过位运算分离出**高优先级**和**低优先级**的任务。

\*\*\* 分离高优先级任务
在 React 底层就是通过 getHighestPriorityLane 分离出高优先级的任务:

```js
function getHighestPriorityLane(lanes) {
  return lanes & -lanes
}
```

举例:

```js
const SyncLane = 0b0000000000000000000000000000001
const InputContinuousLane = 0b0000000000000000000000000000100
const lane = SyncLane | InputContinuousLane
console.log((lane & -lane) === SyncLane) // true
```

## React 位掩码场景（2）——更新上下文

### 更新上下文状态—ExecutionContext

React 中常用的更新上下文表示:

```js
export const NoContext = /*             */ 0b0000000
const BatchedContext = /*               */ 0b0000001
const EventContext = /*                 */ 0b0000010
const DiscreteEventContext = /*         */ 0b0000100
const LegacyUnbatchedContext = /*       */ 0b0001000
const RenderContext = /*                */ 0b0010000
const CommitContext = /*                */ 0b0100000
export const RetryAfterError = /*       */ 0b1000000
```

在 React 事件系统中给 executionContext 赋值 EventContext，在执行完事件后，再重置到之前的状态。

```js
function batchedEventUpdates() {
  var prevExecutionContext = executionContext
  executionContext |= EventContext // 赋值事件上下文 EventContext
  try {
    return fn(a) // 执行函数
  } finally {
    executionContext = prevExecutionContext // 重置之前的状态
  }
}
```

## React 位掩码场景 (3) —更新标识 flag

经历了更新优先级 lane 判断是否更新，又通过更新上下文 executionContext 来判断更新的方向，那么到底更新什么? 又有哪些种类的更新呢？
![image](https://user-images.githubusercontent.com/32337542/223908164-3fbd013d-2203-4bd7-987c-eea3a62c2574.png)

先来看一下 React 应用中存在什么种类的 flags：

```js
export const NoFlags = /*                      */ 0b00000000000000000000000000
export const PerformedWork = /*                */ 0b00000000000000000000000001
export const Placement = /*                    */ 0b00000000000000000000000010
export const Update = /*                       */ 0b00000000000000000000000100
export const Deletion = /*                     */ 0b00000000000000000000001000
export const ChildDeletion = /*                */ 0b00000000000000000000010000
export const ContentReset = /*                 */ 0b00000000000000000000100000
export const Callback = /*                     */ 0b00000000000000000001000000
export const DidCapture = /*                   */ 0b00000000000000000010000000
export const ForceClientRender = /*            */ 0b00000000000000000100000000
export const Ref = /*                          */ 0b00000000000000001000000000
export const Snapshot = /*                     */ 0b00000000000000010000000000
export const Passive = /*                      */ 0b00000000000000100000000000
export const Hydrating = /*                    */ 0b00000000000001000000000000
export const Visibility = /*                   */ 0b00000000000010000000000000
export const StoreConsistency = /*             */ 0b00000000000100000000000000
```

React 的更新流程和如上这个游戏如出一撤，也是分了两个阶段：

- 第一个阶段就像寻宝的小朋友一样，找到待更新的地方，设置更新标志 flags。
- 接下来在另一个阶段，通过 flags 来证明当前 fiber 发生了什么类型的更新，然后执行这些更新。

```js
const NoFlags = 0b00000000000000000000000000
const PerformedWork = 0b00000000000000000000000001
const Placement = 0b00000000000000000000000010
const Update = 0b00000000000000000000000100
//初始化
let flag = NoFlags

//发现更新，打更新标志
flag = flag | PerformedWork | Update

//判断是否有  PerformedWork 种类的更新
if (flag & PerformedWork) {
  //执行
  console.log('执行 PerformedWork')
}

//判断是否有 Update 种类的更新
if (flag & Update) {
  //执行
  console.log('执行 Update')
}

if (flag & Placement) {
  //不执行
  console.log('执行 Placement')
}
```
