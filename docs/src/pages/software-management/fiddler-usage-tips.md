# Fiddler 使用技巧

## 1. 安装证书给 https 使用

Fiddler 手机装证书

- 打开手机的 safary 浏览器的地址, 输入 fiddler 右上方的地址 172.21.14.197:8888
- 然后点击页面里的 FiddlerRoot certificate
- 最后验证通过证书

## 2. 匹配 远端 js 到本地

### 1. cdn 可以 1-4, 末尾可以任意字符

```
regex:(?inx)^http://pre-cdn[1-4].24cp.com/gameapp1_wanlitong/game/farm/libs/min/laya.core.min.js.+

D:\Users\zhengming\Desktop\laya.core.min.js
```

### 2. 末尾带`?`, 注意要改成 `\?`

```
regex:(?inx)^http://youxi36-wap.stg2.24cp.com/files/js/game/horse/horserace.js\?v.+

D:\Users\zhengming\Desktop\horserace.js
```

### 3. 跳转地址

```
EXACT:http://m.1768.com/?act=game_pvz

*redir:http://yx100-wap.stg3.1768.com/?act=game_kpnn
```

### 4. fiddler 模拟 POST 的 404 请求:

```
METHOD:POST REGEX:(?insx)http://youxi36-wap.stg2.24cp.com/.+

*404-SESSION_40
```

### 5. 修改 ajax 请求

1. 注意要先点击下面的红色区域, 先转换下编码
   ![1](https://user-images.githubusercontent.com/32337542/54504703-aaf6a880-496f-11e9-92bd-49e2a4d4d247.png)

2. 把请求拖到 AutoResponder, 并且直接右键鼠标点击请求, 选择 `Edit Response`
   ![2](https://user-images.githubusercontent.com/32337542/54504706-ae8a2f80-496f-11e9-9d1e-b5568d1463c3.png)

3. 选择 TextView, 修改返回头, 然后点击保存。
   ![3](https://user-images.githubusercontent.com/32337542/54504709-b1852000-496f-11e9-9e0e-17cbaf1819af.png)

## 3. 环境对应本地的环境

`D:\Users\Public\Git\gameHall\*\*` 个人的 `gamehall` 本地地址

### 1. 开发环境：

```
regex:^http://yx\d+-wap.stg3.(24cp|1768).com/files/(.*)

D:\Users\Public\Git\gameHall\www\files$2
```

### 2. 测试环境：

```
regex:^http://\d+test\d+-wap.stg3.1768.com/files/(.*)

D:\Users\Public\Git\gameHall\www\files$1
```

### 3. 生产环境：

```
regex:^http://h\d+.jkimg.net/gameapp_24caipiao/(.*)

D:\Users\Public\Git\gameHall\www\files$1
```

### 4. 只转发 js|css：

```
regex:^http://yx\d+-wap.stg3.(24cp|1768).com/files/(.*)\.(js|css)(.*)

D:\Users\Public\Git\gameHall\www\files$2.$3
```

![4](https://user-images.githubusercontent.com/32337542/54504993-07a69300-4971-11e9-9eea-820384f63675.png)

## 4. 设置允许跨域：

![5](https://user-images.githubusercontent.com/32337542/54504990-007f8500-4971-11e9-8517-ba0fd0f92c07.png)

```

```
