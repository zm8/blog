# H5 常见问题解决

## ES 兼容性 API

手机端有的 API 会有兼容性问题，使用会造成页面白屏。所以都使用 lodash 替换。
替换的 API 有:

```js
  Object.values       ----  _.values
  Object.entries      ----  _.entries
  [].flat             ----  _.flatten 或 _.flattenDeep
  [].flatMap          ----  _.flatMap
  Object.fromEntries  ----  _.fromPairs
```

## Date 兼容性问题

```js
var d = new Date("2018-09-20 19:20:32"); // invalid date
alert(d.getTime());
// 必须改成
var d = new Date("2018/09/20 19:20:32");

// 而 moment 没有问题
moment("2018-09-20 10:58").valueOf();
```

## 正则 "向后断言,向后否定断言" 兼容性问题

因为 js 会有一个预编译，所以就算下面 "函数" 不执行，在 PC safari , IOS Mobile , IE 11 都会报错白屏。
具体原因是 "向后断言,向后否定断言" 兼容性问题。

```js
function foo() {
  var reg = /(?<!z)x/;
}
```

<https://caniuse.com/?search=%3F%3C%3D>

![image](https://user-images.githubusercontent.com/32337542/223664614-32cb0eee-8745-42ba-b44b-51d2a6e76498.png)

## H5 唤起 高德地图, 百度地图, 腾讯地图

1. 高德和 Google 在国内 都是使用 GCJ－02 坐标系。
2. 百度坐标系是在 GCJ－02 坐标系的基础上再次加密偏移后形成的坐标系，只适用于百度地图。
3. 如果其他坐标系要转换成百度地图的，可以参考地址: <https://lbsyun.baidu.com/jsdemo.htm#TranslateggTobd>
4. 如果其他坐标系要转换成高德地图的，可以参考地址: <https://lbs.amap.com/api/javascript-api/guide/transform/convertfrom>

### 1. 高德地图

1. IOS

```html
<a
  href="iosamap://navi?sourceApplication=applicationName&poiname=fangheng&poiid=BGVIS&lat=36.547901&lon=104.258354&dev=1&style=2"
>
  IOS 高德地图
</a>
```

参考地址: <https://lbs.amap.com/api/amap-mobile/guide/ios/navi>

2. Android

```html
<a
  href="androidamap://navi?sourceApplication=appname&amp;poiname=fangheng&amp;lat=36.547901&amp;lon=104.258354&amp;dev=1&amp;style=2"
>
  Android 高德地图
</a>
```

参考地址: <https://lbs.amap.com/api/amap-mobile/gettingstarted>

### 2. 百度地图

目前看只有 百度地图 可以传入地址参数(origin, destination)，进行地址解析，其他地图不行。

1. IOS

```html
<a
  href="baidumap://map/direction?src=ios.baidu.openAPIdemo&origin=中关村&destination=北京市海淀区城府路28号&mode=driving&region=北京"
  >百度地图 IOS</a
>
```

参考地址: <https://lbsyun.baidu.com/index.php?title=uri/api/ios>

2. Android

```html
<a
  href="bdapp://map/direction?src=andr.baidu.openAPIdemo&origin=中关村&destination=北京市海淀区城府路28号&mode=driving&region=北京"
  >百度地图 Android</a
>
```

参考地址: <https://lbsyun.baidu.com/index.php?title=uri/api/android>

### 3. 腾讯地图

IOS 和 Android 一样

```html
<a
  href="qqmap://map/routeplan?type=drive&from=清华&fromcoord=39.994745,116.247282&to=怡和世家&tocoord=39.867192,116.493187&referer=OB4BZ-D4W3U-B7VVO-4PJWW-6TKDJ-WPB77"
  >腾讯地图 IOS/Android</a
>
```

:::tip 参考地址
<https://lbs.qq.com/webApi/uriV1/uriGuide/uriMobileRoute>
:::

## 获取元素尺寸准确的方法

`getBoundingClientRect` 比 `offsetHeight` 获取的值更准确

```js
document.querySelector("div").offsetHeight; // 55.1953125
document.querySelector("div").getBoundingClientRect().height; // 55
```

<img width="800" alt="image" src="https://user-images.githubusercontent.com/32337542/154235622-1d7674d4-c7b0-482b-af35-311f67b9f372.png">

## IOS input 的 focus, 不能自动弹起键盘

而 Android 可以

```js
const ref = useRef();
useEffect(() => {
  setTimeout(() => {
    ref.current.focus();
  }, 1000);
}, []);

return <input ref={ref} />;
```

## Promise.prototype.finally() 有的 Android 机不支持

`WebView Android` 支持的版本是 `>=63`
`Safari on iOS` 支持的版本是 `>=11.3`

解决方式:

```bash
> pnpm i promise.prototype.finally
```

```js
const promiseFinally = require("promise.prototype.finally");
promiseFinally.shim();
```

## Proxy

手机端兼容性良好

`WebView Android` 支持的版本是 `>=49`
`Safari on iOS` 支持的版本是 `>=10`
