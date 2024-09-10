# H5 唤起 高德地图, 百度地图, 腾讯地图

### 导言

1. 高德和 Google 在国内 都是使用 GCJ－02 坐标系。
2. 百度坐标系是在 GCJ－02 坐标系的基础上再次加密偏移后形成的坐标系，只适用于百度地图。
3. 如果其他坐标系要转换成百度地图的，可以参考地址: https://lbsyun.baidu.com/jsdemo.htm#TranslateggTobd
4. 如果其他坐标系要转换成高德地图的，可以参考地址: https://lbs.amap.com/api/javascript-api/guide/transform/convertfrom

### 1. 高德地图

1. IOS

```html
<a
  href="iosamap://navi?sourceApplication=applicationName&poiname=fangheng&poiid=BGVIS&lat=36.547901&lon=104.258354&dev=1&style=2"
>
  IOS 高德地图
</a>
```

参考地址: https://lbs.amap.com/api/amap-mobile/guide/ios/navi

2. Android

```html
<a
  href="androidamap://navi?sourceApplication=appname&amp;poiname=fangheng&amp;lat=36.547901&amp;lon=104.258354&amp;dev=1&amp;style=2"
>
  Android 高德地图
</a>
```

参考地址: https://lbs.amap.com/api/amap-mobile/gettingstarted

### 2. 百度地图

目前看只有 百度地图 可以传入地址参数(origin, destination)，进行地址解析，其他地图不行。

1. IOS

```html
<a
  href="baidumap://map/direction?src=ios.baidu.openAPIdemo&origin=中关村&destination=北京市海淀区城府路28号&mode=driving&region=北京"
  >百度地图 IOS</a
>
```

参考地址: https://lbsyun.baidu.com/index.php?title=uri/api/ios

2. Android

```html
<a
  href="bdapp://map/direction?src=andr.baidu.openAPIdemo&origin=中关村&destination=北京市海淀区城府路28号&mode=driving&region=北京"
  >百度地图 Android</a
>
```

参考地址: https://lbsyun.baidu.com/index.php?title=uri/api/android

### 3. 腾讯地图

IOS 和 Android 一样

```html
<a
  href="qqmap://map/routeplan?type=drive&from=清华&fromcoord=39.994745,116.247282&to=怡和世家&tocoord=39.867192,116.493187&referer=OB4BZ-D4W3U-B7VVO-4PJWW-6TKDJ-WPB77"
  >腾讯地图 IOS/Android</a
>
```

::: 参考地址
https://lbs.qq.com/webApi/uriV1/uriGuide/uriMobileRoute
:::
