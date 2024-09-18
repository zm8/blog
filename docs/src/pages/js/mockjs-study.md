# Mockjs 学习

## 1. 介绍

功能: 主要用来本地 mock 数据时生成随机数据, 快捷方便。机数据
官网地址: http://mockjs.com/

## 2. 例子 ([codesandbox 在线编辑](https://codesandbox.io/s/kind-hooks-cs347))

### 简单例子 1

比如要生成 数组有 3 个元素, id 是累加的, status 是随机 1-3 的数字。

```javascript
{
    "list": [
        {
            "id": 1,
            "status": 2
        },
        {
            "id": 2,
            "status": 3
        },
        {
            "id": 3,
            "status": 1
        }
    ]
}


// 代码如下
import { mock } from "mockjs";
var data = mock({
  "list|3": [
    {
      "id|+1": 1,
      "status|1-3": 1
    }
  ]
});
```

### 复杂例子 2:

比如要生成如下的数据格式, 便于我们网页上 **查看数据变化**, 特别注意操作人前面有个 **累加的数字。**

![image](https://user-images.githubusercontent.com/32337542/67463532-2e9a1580-f674-11e9-8c96-1996729fe983.png)

```javascript
{
    "total": 3,
    "list": [
        {
            "name": "1__桂文龙"
            "status": 3,
            "time": "1981-04-24 17:02:55",
            "email": "o.jxdzh@jwbws.cd",
            "url": "http://obwdylj.bh/lrmoxbc",
        },
        {
            "name": "2__桂文龙"
            "status": 3,
            "time": "1975-04-26 19:09:28",
            "email": "h.lgfcoolh@syenuucgs.kw",
            "url": "http://wvhyfy.ba/dexbxxls",
        },
        {
            "name": "3__桂文龙"
            "status": 2,
            "time": "1983-02-26 15:00:06",
            "email": "r.bngke@wdr.io",
            "url": "http://kthf.tn/qzwboleyy",
        },
    ]
}

// 代码如下:
import { mock } from "mockjs";

var data = mock({
  // 这里可以完美的返回 list 的个数
  total: function() {
    return this.list.length;
  },
  "list|1-5": [
    {
      "_id|+1": 1,
      // name 独门秘诀, 官网没有提供直接的实现方式, 通过 _id 来累加
      name: function() {
        return this._id + "__桂文龙";
      },
      "status|1-3": 1,
      time: "@datetime(yyyy-MM-dd HH:mm:ss)",
      email: "@email",
      url: '@url("http")',
      // _DEL 这个可加，可不加, 为了消除属性 _id 和 _DEL
      _DEL: function() {
        delete this._id;
        delete this._DEL;
      }
    }
  ]
});
```

## 3. 功能基础介绍

### 一. 基础用法

1. 数组 --- 重要,常用
   'id|2': [0] => 'id': [0,0]
   'id|1-3': [0] => 随机生成 'id':[0] 或 'id':[0,0] 或 'id':[0,0,0]

2. 字符串
   'str|2': 'ab' => 'str':'abab'
   'str|1-3': 'ab' => 随机生成 'str':'ab' 或 'str':'abab' 或 'str':'ababab'

3. 数字

- 自动累加数字, 输出:

```javascript
list|2:[{
    'id|+1': 1
}]
list: [{
    'id': 1,
    'id': 2
}]
```

- 随机生成数字
  'id|98-100':1 => 随机生成 'id':98 或 'id':99 或 'id':100
  **注意: 数字 1 没啥意义，只是代表类型是数字**

4. bool
   'name|1': true => 随机生成 'name': true 或 'name': false

5. 正则
   'name': /\d{1,3}/ => 随机 5 或 66 或 777

6. 函数
   'name': ()=>1 => 返回 {'name': 1}

### 二. Mock.Random

Mock.Random 可以使用 '@' 来代替, 推荐使用 '@' 更加简洁, 如果调用函数的返回数据则必须用 Mock.Random

1. 日期
   'date': Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
   或 'date': '@datetime(yyyy-MM-dd HH:mm:ss)'
   => 'date': 2002-07-21 14:29:56

2. 邮件
   {'email': Random.email()} 或 {'email': '@email'}
   => "c.gkll@pvcsdealk.cy"

3. 随机数字
   @integer(60,100) => 随机 60 到 100 的整数, 比如: 96

4. 随机字符串
   @word(3,5) => 随机生成 'jms' 或 'atda' 或 'aunfd'

5. 随机 URL @url( protocol?, host? )
   @url('http') => 随机一个 http, "http://mhutzpc.ai/ubpchd"
