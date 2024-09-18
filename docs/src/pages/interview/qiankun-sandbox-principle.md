# Qiankun 的沙箱原理及其实现

js 沙箱其实没有完全的隔离，因为它仍然运行在同一浏览器上下文中，共享同一个 window。

## 快照沙箱(snapshotSandbox)

对于没有 Proxy API 的 IE 浏览器。
使用 windowSnapshot 先拷贝一份 window 所有属性值。还原沙箱的时候，对比 window 和 windowSnapshot 的差异，通过 modifyPropsMap 记录不一样的地方。

```js
const iter = (window, callback) => {
  for (const prop in window) {
    if (window.hasOwnProperty(prop)) {
      callback(prop);
    }
  }
};
class SnapshotSandbox {
  constructor() {
    this.proxy = window;
    this.modifyPropsMap = {};
  }
  // 激活沙箱
  active() {
    // 缓存active状态的window
    this.windowSnapshot = {};
    iter(window, (prop) => {
      // 把 window 的所有属性都拷贝，赋值给 windowSnapshot
      this.windowSnapshot[prop] = window[prop];
    });
    // 把之前修改过的属性重新赋值给  window
    Object.keys(this.modifyPropsMap).forEach((p) => {
      window[p] = this.modifyPropsMap[p];
    });
  }
  // 退出沙箱
  inactive() {
    iter(window, (prop) => {
      if (this.windowSnapshot[prop] !== window[prop]) {
        // 对比 windowSnapshot 和 window 下的所有属性，发现不一样的地方，则把不一样的地方记录到 modifyPropsMap。
        this.modifyPropsMap[prop] = window[prop];
        // 还原 window 的属性。
        window[prop] = this.windowSnapshot[prop];
      }
    });
  }
}
```

```js
const sandbox = new SnapshotSandbox();
((window) => {
  // 激活沙箱
  sandbox.active();
  window.sex = "男";
  window.age = "22";
  console.log(window.sex, window.age); // 男, 22
  // 退出沙箱
  sandbox.inactive();
  console.log(window.sex, window.age); // undefined, undefined
  // 激活沙箱
  sandbox.active();
  console.log(window.sex, window.age); // 男 22
})(sandbox.proxy);
```

## legacySandbox(单例沙箱)

通过 Proxy 来实现，同样会对 window 造成污染，但是性能比快照沙箱好，不用遍历 window 对象。
使用 addedPropsMapInSandbox 记录新增的属性的值，使用 modifiedPropsOriginalValueMapInSandbox 记录更改的属性的值。
**退出沙箱** 的时候根据 addedPropsMapInSandbox 和 modifiedPropsOriginalValueMapInSandbox 对 window 对象进行还原。

```js
class Legacy {
  constructor() {
    // 沙箱期间新增的全局变量
    this.addedPropsMapInSandbox = {};
    // 沙箱期间更新的全局变量
    this.modifiedPropsOriginalValueMapInSandbox = {};
    // 持续记录更新的(新增和修改的)全局变量的 map，用于在任意时刻做 snapshot
    this.currentUpdatedPropsValueMap = {};
    const rawWindow = window;
    const fakeWindow = Object.create(null);
    this.sandboxRunning = true;
    const proxy = new Proxy(fakeWindow, {
      set: (target, prop, value) => {
        // 如果是激活状态
        if (this.sandboxRunning) {
          // 判断当前window上存不存在该属性
          if (!rawWindow.hasOwnProperty(prop)) {
            // 记录新增值
            this.addedPropsMapInSandbox[prop] = value;
          } else if (!this.modifiedPropsOriginalValueMapInSandbox[prop]) {
            // 记录更新值的初始值
            const originValue = rawWindow[prop];
            this.modifiedPropsOriginalValueMapInSandbox[prop] = originValue;
          }
          // 纪录此次修改的属性
          this.currentUpdatedPropsValueMap[prop] = value;
          // 将设置的属性和值赋给了当前window，还是污染了全局window变量
          rawWindow[prop] = value;
          return true;
        }
        return true;
      },
      get: (target, prop) => {
        return rawWindow[prop];
      }
    });
    this.proxy = proxy;
  }
  active() {
    if (!this.sandboxRunning) {
      // 还原上次修改的值
      for (const key in this.currentUpdatedPropsValueMap) {
        window[key] = this.currentUpdatedPropsValueMap[key];
      }
    }

    this.sandboxRunning = true;
  }
  inactive() {
    // 将更新值的初始值还原给window
    for (const key in this.modifiedPropsOriginalValueMapInSandbox) {
      window[key] = this.modifiedPropsOriginalValueMapInSandbox[key];
    }
    // 将新增的值删掉
    for (const key in this.addedPropsMapInSandbox) {
      delete window[key];
    }

    this.sandboxRunning = false;
  }
}

window.sex = "男";
let LegacySandbox = new Legacy();
((window) => {
  // 激活沙箱
  LegacySandbox.active();
  // window.sex = '女';
  window.age = "22";
  console.log(window.sex, window.age); // 女 22

  // 退出沙箱
  LegacySandbox.inactive();
  console.log(window.sex, window.age); // 男 undefined

  // 激活沙箱
  LegacySandbox.active();
  console.log(window.sex, window.age); // 女 22
})(LegacySandbox.proxy);
```

### proxySandbox(多例沙箱)

把 window 的一些属性(document、location、top、window)拷贝出来放到 fakeWindow 里，对每个微应用分配一个 fakeWindow。

修改全局变量:

- 原生的属性，则修改 window 属性
- 非原生的属性，则修改 fakeWindow

获取全局变量:

- 原生的属性，则从 window 里面拿
- 非原生的属性，则从 fakeWindow 里拿

## 坑

### 1. CSS 样式隔离

子应用的如果有个弹层，那么它显示的时候，会挂载到主应用的上面，会造成样式丢失。
css 沙箱有严格沙箱(strictStyleIsolation) 和 实验性沙箱(experimentalStyleIsolation)。

**严格沙箱**会把整个子应用挂在 shadow dom 下面，那么外面的样式影响不到里面，里面的样式影响不到外面。
但是对于弹层会挂载到主应用的 body 上面，造成样式丢失。

**实验性沙箱**
会给每一个子应用最外层添加 `div[data-qiankun-microName] ` 来隔离不同的子应用和主应用。
![image](https://github.com/zm8/blog_old/assets/32337542/e19c6b5f-6627-4e95-842a-e7b7c3337027)

但是还是没有解决 弹层挂载到主应用 body 上面，样式丢失问题。

css 最终方案:
不用 qiankun css 样式隔离

### 2. 全局调用方法报错

由于 this 绑定的上下文是 window.Proxy, 所以执行 add(1,2) 相当于执行了 `window.add(1,2)`就会报 `add is undefined`
修改的方式是定义 `window.add = (a, b) => a + b`

```js
add = (a, b) => {
  return a + b;
};

add(1, 2);
```

:::tip 参考地址
<https://juejin.cn/post/7148075486403362846?searchId=20230926232146DB8316AE2AA7246E676E#heading-4>

<https://juejin.cn/post/6920110573418086413#heading-7>
:::
