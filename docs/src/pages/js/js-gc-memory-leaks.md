# JavaScript 垃圾回收和内存泄漏

## 1. 什么是垃圾

当程序中的某些内存数据无法被访问到时（即无法触达），这些数据就被称为垃圾。

## 2. 什么是内存泄漏

满足下面 2 种情况，就是内存泄漏。

- 我们确定不再需要某块内存。
- 垃圾回收器没有回收掉这块内存，导致它仍然占用内存空间。

## 3. 垃圾回收的机制

`JavaScript` 使用`标记清除`算法来进行垃圾回收。其核心思想是：通过判断程序中哪些内存仍然可以被访问（即被触达），那些不能被访问的内存就会被标记为垃圾并被清除。

## 4. 内存泄漏和闭包

- 闭包本身并不会导致内存泄漏，但如果闭包持有了不再需要的函数引用，就会导致与该函数关联的词法环境无法销毁，从而造成内存泄漏。
- 当多个函数共享同一个词法环境时，会导致这个词法环境无法销毁，从而使相关的内存无法回收，最终引发内存泄漏。(例子 5.3)

## 5. 例子

### 5.1 使用 `FinalizationRegistry` 可以监听垃圾回收

过了几秒钟, 控制台后打印 `清理 o 对象`。

```ts
let o: any = {};
setTimeout(() => {
  o = null;
}, 0);
const registry = new window.FinalizationRegistry((key) => {
  console.log("清理", key);
});
registry.register(o, "o 对象");
```

如果想立即看到控制打印, 可以切换 `Performance` 面板, 然后点击`垃圾回收`(`Garbage Collection`)按钮。

<img width="806" alt="image" src="https://github.com/user-attachments/assets/5613b270-7b16-4d82-bee7-dd061f96f800">

### 5.2 `WeakSet` 的垃圾回收

```ts
const ws = new WeakSet();
let o: any = {};
ws.add(o);

setTimeout(() => {
  o = null;
}, 0);

console.log(ws.has(o)); // 垃圾还没有回收, 返回 true

setTimeout(() => {
  console.log(ws.has(o)); // 垃圾已经回收, 返回 false
}, 0);

const registry = new window.FinalizationRegistry((key) => {
  console.log("清理", key);
});
registry.register(o, "o 对象");
```

### 5.3 内存不能被回收的特殊情况

无法触达的内存空间, 照理肯定会被回收，但是有特殊情况。

下面的例子, 点击按钮后, `doms`数组被创建, 但 `doms` 数组其实是无法被触达, 照理应该会被回收, 但是 `_temp` 函数引用了 `doms` 数组, 导致了 `doms` 数组的内存空间无法被回收。

如果移除 `_temp` 函数, 那么不管点击几次按钮, `doms` 数组都会被垃圾回收。

```html
<!DOCTYPE html>
<html>
  <head>
    <title>垃圾回收</title>
  </head>
  <body>
    <button id="btn">按钮</button>
    <script>
      function createIncreate() {
        const doms = new Array(100000).fill(0).map((_, i) => {
          const dom = document.createElement("div");
          dom.innerHTML = i;
          return dom;
        });
        function increate() {}
        function _temp() {
          doms;
        }
        return increate;
      }
      let increate;
      btn.addEventListener("click", () => {
        increate = createIncreate();
      });
    </script>
  </body>
</html>
```

使用 `Memory` 面板可以查看内存情况。

- 右侧选择 `Heap Snapshot`。
- 点击红色按钮 `Take Heap Snapshot`

<img width="1142" alt="image" src="https://github.com/user-attachments/assets/602363f0-c3a5-433b-b1ae-4cebead01183">

生成了一个快照, 内存为 `11.7M`

<img width="1142" alt="image" src="https://github.com/user-attachments/assets/e2bb794e-daa8-47c7-ade7-660263e4de98">

点击页面的 `button` 按钮, 然后再次点击 `Take Heap Snapshot`, 生成了另外一个快照, 内存为 `31.3M`。

<img width="1146" alt="image" src="https://github.com/user-attachments/assets/394d8144-8db9-4a99-aa3b-c1a6c2aa12bd">

选择 `Comparison` 标签, 对比两个快照。

<img width="1146" alt="image" src="https://github.com/user-attachments/assets/e276aba1-ac4b-4a94-8751-7e167c5b3b70">

- `#New` 表示在两个快照之间新创建的对象数量。
- `#Deleted` 表示在两个快照之间被删除的对象数量。
- `#Delta` 表示两个堆快照（heap snapshots）之间的对象数量变化。
  计算公式：`#Delta = #New - #Deleted`
- `Alloc. Size` 表示新分配的内存大小（以字节为单位）
- `Freed Size` 表示释放的内存大小（以字节为单位）
- `Size Delta` 表示内存大小的净变化。
  计算公式：`Size Delta = Alloc. Size - Freed Size`

### 5.4 `Memory` 面板查看对比情况

- 首次点击按钮, 会创建 `654321` 个 `dom` 元素，再次点击按钮, 会创建 `54321` 个 `dom` 元素。
- 可以验证：`#Delta = #New - #Deleted`
- 可以验证：`Size Delta = Alloc. Size - Freed Size`

<img width="1141" alt="image" src="https://github.com/user-attachments/assets/5c793fd6-81cc-4ea3-ba79-85fa91a04487">

```html
<!DOCTYPE html>
<html>
  <head>
    <title>垃圾回收</title>
  </head>
  <body>
    <button id="btn">按钮</button>
    <script>
      function createDoms() {
        let doms;
        function increateLarge() {
          doms = new Array(654321).fill(0).map((_, i) => {
            const dom = document.createElement("div");
            return dom;
          });
        }
        function increateSmall() {
          doms = new Array(54321).fill(0).map((_, i) => {
            const dom = document.createElement("div");
            dom.innerHTML = i;
            return dom;
          });
        }
        return { increateLarge, increateSmall };
      }
      const doms = createDoms();
      let i = 0;
      btn.addEventListener("click", () => {
        if (i === 0) {
          doms.increateLarge();
          i++;
        } else {
          doms.increateSmall();
          i--;
        }
      });
    </script>
  </body>
</html>
```
