# Session 是什么?

## 1.session 是啥？

- `session` 是一次浏览器和服务器的交互的会话，会话是啥呢？就是我问候你好吗？你回恩很好。就是一次会话。
- `session` 的全部机制也是基于这个 `session_id`，它用来区分哪几次请求是一个人发出的。一个页面可能会被成百上千人访问，可通过唯一的 `session_id` 来绑定每个用户。一个用户在一次会话上就是一个 `session_id`，这样成千上万的人访问，服务器也能区分到底是谁在访问了。

## 2. session 的运行机制？

我们在 `php.iyangyi.com` 域名下的 `a.php` 页面中，输入如下代码：

```php
session_start();
echo "SID: ".SID."<br>";
echo "session_id(): ".session_id()."<br>";
echo "COOKIE: ".$_COOKIE["PHPSESSID"];
```

我们访问一下 a.php 页面，看下会输出什么:

```
SID: PHPSESSID=bjvlo4p38cfqkr1hr7pe924ts3
session_id(): bjvlo4p38cfqkr1hr7pe924ts3
Cookie:
```

再次刷新页面，返回：

```
SID:
session_id(): bjvlo4p38cfqkr1hr7pe924ts3
COOKIE: bjvlo4p38cfqkr1hr7pe924ts3 (COOKIE里 的name 是 PHPSESSID)
```

- SID 是一个系统常量，SID 包含着会话名以及会话 ID 的常量，格式为 `name=ID`，或者如果会话 ID 已经在适 cookie 中设定时则为空字符串。
- `session_id()` 函数用来返回当前会话的 `session_id`。

流程是这样的:

- 每次我们访问一个页面，如果有开启 `session`，也就是有 `session_start()` 时，就会自动生成一个 `session_id` 来标注是这次会话的唯一 ID，同时也会自动往 cookie 里写入一个名字为 `PHPSESSID` 的变量，它的值正是 `session_id`。

- 当这次会话没结束，再次访问的时候，浏览器会把 `cookie` 里的 `PHPSESSID` 传给服务器，服务器会去读取这个 `cookie` 是否有值有没过期，如果能够读取到，则继续用这个 `session_id`，如果没有，就会新生成一个 `session_id`，同时生成 `PHPSESSID` 这个 `cookie`。

## 3. session 的保存？

根据 `php.ini` 里的配置，可以保存在服务器的临时目录里，也可以保存在 `redis` 里。
假设 `php.ini` 里的配置 `session.save_path = "d:/wamp/tmp",`, 则是以 `sess_ + session_id` 的形式存在这个临时目录下

![image](https://user-images.githubusercontent.com/32337542/55967694-5237d880-5cad-11e9-8a79-e9ac4537ac92.png)

这些文件里面存储里什么呢，假设写以下 php 语句:

```php
$_SESSION['hello'] = 123;
$_SESSION['word'] = 456;
```

打开文件 `sess_bgg20mcl86drbt3j08jg5h5h17`，内容如下：

```php
hello|i:123;word|i:456;
```

这个`sess`文件不会随着客户端的 `PHPSESSID` 过期，也一起过期掉，它会一直存在，直到 `GC` 扫描到它过期或者使用 `session_destroy()` 函数摧毁。

## 4. session 里的相关配置

```php
[Session]

// session的存储方式, 默认是文件存储还有 memcache 和 redis
session.save_handler = files

session.save_path = "d:/wamp/tmp"

// 是否 在客户端生成PHPSESSID这个cookie，默认1，则是使用
session.use_cookies = 1

session.name = PHPSESSID

// 是否自动开启session, 默认不开启，需要用 session_start();函数开启
session.auto_start = 0

// 客户端生成PHPSESSID这个cookie的过期时间, 默认是0，也就是关闭浏览器就过期
session.cookie_lifetime = 0

session.serialize_handler = php

session.gc_divisor = 1000

session.gc_probability = 1

session.gc_maxlifetime = 1440
```

## 5. 用 redis 存储 session

### 1. 比文件存储的优点有

- 更快的读取和写入速度。redis 直接操作内存，比文件的形式快。
- 更好的设置过期时间
- 更好的分布式同步

### 2. 如何配置 php

```php
session.save_handler = redis
session.save_path = "tcp://127.0.0.1:6381"
```

### 3. 如何存储

它是用 `PHPREDIS_SESSION: session_id`，是一个字符串的形式，带生存周期。

![image](https://user-images.githubusercontent.com/32337542/56188863-2627a900-6059-11e9-9c26-d7b72ce5ddf5.png)

它的值和文件存储 `session` 一模一样，都是用 `php` 序列化后存储。
过期时间默认是 `1440` 秒，是通过配置文件 `session.gc_maxlifetime = 1440` 来设定。

::: tip 参考链接
https://blog.csdn.net/think2me/article/details/38726429
:::
