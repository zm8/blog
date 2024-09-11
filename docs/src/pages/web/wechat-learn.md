# 微信小程序学习

### 1. app.json 里的 pages 字段的第一个页面就是这个小程序的首页

```json
{
  "pages": ["pages/index/index", "pages/logs/logs"]
}
```

### 2. getApp() 获取当前的 app 实例

### 3. `<block>` 不是一个组件，它仅仅是一个包装元素，只接受控制属性，不会在页面中做任何渲染。

### 4. `app.json` 的 JSON 数据格式 的 value 值不能为 undefined

### 5. JSON 文件(`app.json`)中无法使用注释，试图添加注释将会引发报错。

![image](https://user-images.githubusercontent.com/32337542/59157527-bf65bf80-8ade-11e9-950e-fb39c332e32f.png)

### 6. 条件逻辑

使用 `wx:elif` 和 `wx:else` 来添加一个 else 块

```html
<view wx:if="{{length > 5}}"> 1 </view>
<view wx:elif="{{length > 2}}"> 2 </view>
<view wx:else> 3 </view>
```

`wx:if` 控制属性

```html
<block wx:if="{{true}}">
  <view> view1 </view>
  <view> view2 </view>
</block>
```

### 7. 列表渲染

用 `wx:for` 来绑定数组。`index` 和 `item` 是对应数组的下标和值。

```html
<!-- array 是一个数组 -->
<view wx:for="{{array}}"> {{index}}: {{item.message}} </view>
```

对应的脚本文件:

```javascript
Page({
  data: {
    array: [
      {
        message: "foo"
      },
      {
        message: "bar"
      }
    ]
  }
});
```

使用 `wx:for-item` 指定数组当前元素的变量名，使用 `wx:for-index` 指定数组当前下标的变量名

```javascript
{{idx}}: {{itemName.message}}
```

为了不让渲染层改变数组 重新渲染，需要指定 `wx:key`，`wx:key` 的值以两种形式提供：

1. 字符串，代表在 `for` 循环的 `array` 中 `item` 的某个 `property`，该 `property` 的值需要是列表中唯一的字符串或数字，且不能动态改变。
2. 保留关键字 `this` 代表在 `for` 循环中的 `item` 本身，这种表示需要 `item` 本身是一个唯一的字符串或者数字，如：

```javascript
<switch wx:for="{{objectArray}}" wx:key="unique" > {{item.id}} </switch>
<switch wx:for="{{numberArray}}" wx:key="*this" > {{item}} </switch>

Page({
  data: {
    objectArray: [
      {id: 5, unique: 'unique_5'},
      {id: 4, unique: 'unique_4'},
      {id: 3, unique: 'unique_3'},
      {id: 2, unique: 'unique_2'},
      {id: 1, unique: 'unique_1'},
      {id: 0, unique: 'unique_0'},
    ],
    numberArray: [1, 2, 3, 4]
  }
});
```

### 8. 引用

import 可以引用模版

```html
<!-- item.wxml -->
<template name="item">
  <text>{{text}}</text>
</template>

<import src="item.wxml" />
<template is="item" data="{{text: 'forbar'}}" />
```

include 可以将目标文件中除了`<template/> <wxs/>`外的整个代码引入，相当于是拷贝到 include 位置

```html
<!-- index.wxml -->
<include src="header.wxml" />
<view> body </view>
<include src="footer.wxml" />

<!-- header.wxml -->
<view> header </view>

<!-- footer.wxml -->
<view> footer </view>
```

### 9. rpx

`rpx` 会做一次 `px` 换算。换算是以 `375` 个物理像素为基准
举个例子：`iPhone6` 屏幕宽度为 `375px`，共 `750` 个物理像素，那么 `1rpx = 375 / 750 px = 0.5px`。

![image](https://user-images.githubusercontent.com/32337542/59177794-b84aba00-8b8f-11e9-93da-f251ac134130.png)

### 10. 官方样式库

https://github.com/Tencent/weui-wxss

### 11. ECMAScript

浏览器中 JavaScript 构成如下图：

![image](https://user-images.githubusercontent.com/32337542/59177907-095aae00-8b90-11e9-84a3-4d74c0e61a03.png)

NodeJS 中 JavaScript 构成如下图：
![image](https://user-images.githubusercontent.com/32337542/59177921-11b2e900-8b90-11e9-8c5e-a4a811b64223.png)

小程序中 JavaScript 构成如下图:
![image](https://user-images.githubusercontent.com/32337542/59177932-1d9eab00-8b90-11e9-84e6-473e88ccb1d2.png)

### 12. App 的生命周期

App 的生命周期是由微信客户端根据用户操作主动触发的。为了避免程序上的混乱，我们不应该从其他代码里主动调用 App 实例的生命周期函数。
触发顺序: `onLoad -> onShow-> onReady`, `onLoad` 最早触发
`onLoad` 和 `onReady`: 在页面没被销毁之前**只会触发 1 次**

- 刚进入 A 页面的时候触发, A`onLoad, onShow, onReady`

- 当点击 A 页面的按钮调用 `wx.navigateTo(B)` 方法时, 触发 A `onHide`, 触发 `B onLoad, onShow, onReady`

- 当点击 A 页面的按钮调用 `wx.redirectTo(B)` 方法时, 触发 A `onUnload`, 触发 B `onLoad, onShow, onReady`

- 当点击 B 页面的头部的自带的返回按钮(相当于触发 `wx.navigateBack`), 触发 B `onUnload`, 注意不会触发 `B onHide`, 触发首页 A `onShow`。相当于清空当前的页面栈。

- 当点击 B 页面的按钮调用 `wx.redirectTo(A)`, 触发 B `onUnload`，触发 A `onLoad,onShow,onReady`，并且当前页面头部没有返回按钮。相当于清空所有页面栈。

综上所诉：

- `onShow` 总是会触发。
- 在 `onLoad` 的回调中，可以获取当前页面所调用的打开参数 `option`

### 13. 页面栈

- 使用 `wx.navigateTo({ url: 'pageD' })` 可以往当前页面栈多推入一个 `pageD`, 此时页面栈变成 `[pageA, pageB, pageC, pageD]`。

- 使用 `wx.navigateBack()` 可以退出当前页面栈的最顶上页面，此时页面栈变成 `[pageA, pageB, pageC]`。

- 使用 `wx.redirectTo({ url: 'pageE' })` 是替换当前页变成 `pageE`, 此时页面栈变成 `[pageA, pageB, pageE]`，当页面栈到达 10 层没法再新增的时候，往往就是使用 `redirectTo` 这个 API 进行页面跳转。

- 使用 `wx.reLaunch({ url: 'pageH' })` 重启小程序，并且打开 `pageH`，此时页面栈为`[pageH]`

- 使用 `wx.switchTab` 来支持 `Tabbar` 页, 此时原来的页面栈会被清空(除了已经声明为 `Tabbar` 页 `pageA` 外) `[pageA,pageF]`

```json
// app.json定义小程序底部tab
{
  "tabBar": {
    "list": [
      { "text": "Tab1", "pagePath": "pageA" },
      { "text": "Tab1", "pagePath": "pageF" },
      { "text": "Tab1", "pagePath": "pageG" }
    ]
  }
}
```

- `wx.navigateTo` 和 `wx.redirectTo` 只能打开非 `TabBar` 页面，`wx.switchTab` 只能打开 `Tabbar` 页面。

### 14. 文件构成和路径

一个页面的文件需要放置在同一个目录下，其中 `WXML` 文件和 `JS` 文件是必须存在的，`JSON` 和 `WXSS` 文件是可选的。
页面路径需要在小程序代码根目录 `app.json` 中的 `pages` 字段声明，否则这个页面不会被注册到宿主环境中。

```
{
  "pages":[
    "pages/index/page", // 第一项默认为首页
    "pages/other/other"
  ]
}
```

### 15.setData

由于小程序的渲染层和逻辑层分别在两个线程中运行，所以 `setData` 传递数据实际是一个异步的过程，所以 `setData` 的第二个参数是一个 `callback` 回调，在这次 `setData` 对界面渲染完毕后触发。
`setData` 其一般调用格式是 `setData(data, callback)`，其中 data 是由多个 `key: value` 构成的 `Object` 对象。
不要把 `data` 中的任意一项的 `value` 设为 `undefined`，否则可能会有引起一些不可预料的 bug。

```
// page.js
Page({
  onLoad: function(){
    this.setData({
      text: 'change data'
    }, function(){
      // 在这次setData对界面渲染完毕后触发
    })
  }
})
```

### 16.触摸反馈

触摸这个行为给予用户一些响应

```js
/*page.wxss */
.hover{
  background-color: gray;
}

<!--page.wxml -->
<button hover-class="hover"> 点击button </button>
<view hover-class="hover"> 点击view</view>
```

![image](https://user-images.githubusercontent.com/32337542/59258773-2b752e80-8c6b-11e9-9893-f02297d95772.png)

### 17.button 的 loading 属性

```
<button loading="true" bindtap="tap">操作</button>
```

![image](https://user-images.githubusercontent.com/32337542/59258899-60818100-8c6b-11e9-848f-69b093fd989d.png)

### 18.Toast

默认 1.5 秒后自动消失

```
wx.showToast({ // 显示Toast
      title: '已发送',
      icon: 'success',
      duration: 1500
    })
    // wx.hideToast() // 隐藏Toast
```

![image](https://user-images.githubusercontent.com/32337542/59258979-873fb780-8c6b-11e9-9f3e-d4027862e28b.png)

### 19.显示模态对话框

```js
wx.showModal({
      title: '标题',
      content: '告知当前状态，信息和解决方法',
      confirmText: '主操作',
      cancelText: '次要操作',
      success: function(res) {
        if (res.confirm) {
          console.log('用户点击主操作')
        } else if (res.cancel) {
          console.log('用户点击次要操作')
        }
      }
```

![image](https://user-images.githubusercontent.com/32337542/59259244-fb7a5b00-8c6b-11e9-9a3e-717c3bfd2ed5.png)

### 20.下拉刷新

```js
//page.json
{"enablePullDownRefresh": true }

//page.js
Page({
  onPullDownRefresh: function() {
    // 用户触发了下拉刷新操作
    // 拉取新数据重新渲染界面
    // wx.stopPullDownRefresh() // 可以停止当前页面的下拉刷新。
  }
})
```

![image](https://user-images.githubusercontent.com/32337542/59259388-51e79980-8c6c-11e9-82b8-dee84c53e5bb.png)

### 21.页面上拉触底

```js
//page.json
// 界面的下方距离页面底部距离小于onReachBottomDistance像素时触发onReachBottom回调
{"onReachBottomDistance": 100 }


//page.js
Page({
  onReachBottom: function() {
    // 当界面的下方距离页面底部距离小于100像素时触发回调
  }
})
```
