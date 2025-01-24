# 常见开发问题和解决方案

今天我来分享一些常见的开发问题和解决方案。

## 1. Git 全局忽略文件名的大小

- 在默认情况下，Git 会忽略文件名的大小写差异。例如，`README.md` 和 `readme.md` 会被认为是同一个文件。
- 如果设置为 `false`，Git 将识别大小写不同的文件名为两个独立的文件。

```bash
git config --global core.ignorecase false
```

## 2. 小程序编译报错 `unknown: Unexpected character ''`

### 问题描述

编译时报错，可能是代码中包含不可见字符。

### 解决方法

使用 Sublime Text 打开文件，查找并删除多余字符。

示例截图:


![](https://files.mdnice.com/user/86144/355a9c38-8068-47d6-8066-ecaf58c7ca1a.png)

![](https://files.mdnice.com/user/86144/549115bf-c91b-43a3-a411-9863fe1c0306.png)

## 3. Chrome 开发者工具搜索代码中的中文

### 背景

在调试 React 或 Vue 的生产环境时，可能需要在打包压缩的 JS 文件中搜索中文字符，但直接搜索常常找不到。

### 解决方案

需要先将中文字符转换为 Unicode。

#### 代码

```js
function toUnicode(str) {
  return str
    .split('')
    .map(char => '\u' + char.charCodeAt(0).toString(16).padStart(4, '0'))
    .join('');
}

toUnicode("以下数据仅供参考");
// '\u4ee5\u4e0b\u6570\u636e\u4ec5\u4f9b\u53c2\u8003'
```

### 代码解释

- `str.split('')`：将字符串分割为单字符数组。
- `char.charCodeAt(0)`：获取每个字符的 Unicode 编码。
- `.toString(16)`：将编码转换为十六进制字符串。
- `.padStart(4, '0')`：保证每个编码长度为 4 位，前面补零。
- `\u`：每个字符的 Unicode 编码以 `\u` 开头。
- `.join('')`：将结果数组拼接成完整字符串。

## 4. 上传大文件报 500 错误

### 问题描述

在本地开发环境上传大文件（如 100KB）正常，但在开发或测试环境上传时，服务器返回 500 错误。

### 排查及解决

尽管已设置跨域允许，控制台仍提示跨域问题。 真正原因是文件目录访问权限不足。需运维配置 `nginx` 的 `client_body_temp_path`（如 `/var/lib/nginx`）目录的写权限。

## 5. 跨域下获取自定义返回头字段

### 问题描述

在跨域请求中，默认只能获取以下返回头字段：

```
Cache-Control
Content-Language
Content-Type
Expires
Last-Modified
Pragma
```

### 解决方法

若需要获取其他字段（如 `Date`），服务端需设置：

```
Access-Control-Expose-Headers: Date
```

前端获取返回头代码示例：

```js
fetch("http://localhost:44441/").then((res) => {
  for (let [key, value] of res.headers) {
    console.log(key, value);
  }
  return res.text();
});
```

## 6. Git 错误 `error: cannot lock ref`

### 问题描述

Git 操作报错：
```
error: cannot lock ref 'refs/remotes/orgin/examination/190326_xxx_xxx': unable to resolve reference 'refs/remotes/orgin/examination/190326_xxx_xxx': reference token
```

### 解决方法

1. 删除相关文件：

```bash
rm -rf .git/refs/remotes/origin/examination/190326_xxx_xxx
```

2. 若问题未解决，删除整个 `refs` 目录：

```bash
rm -rf .git/refs/
git init
git reset --hard origin/feature/190326_xxx_xxx
git fetch --prune
```
