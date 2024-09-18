# 常用命令

## pnpm 安装包使用代理

执行下面命令拷贝 SOCKSProxy 和 SOCKSPort

```bash
scutil --proxy
```

临时使用代理下载 npm 包:

```bash
HTTPS_PROXY=http://127.0.0.1:7891 pnpm install koa
```

## mac 命令显示所有文件

```bash
ls -a
```

## mac 命令行进入 u 盘

```bash
cd /Volumes/[U 盘名称]
```

## 移除压缩文件夹里面的 `__MACOSX` 和 `.DS_Store`

```bash
zip -d 测试.zip "__MACOSX*" "*/.DS_Store"
```

### Window 和 Mac 删除文件和文件夹

Window:

```bash
del /f yarn.lock
rmdir /s /q node_modules
```

Mac:

```bash
rm -rf yarn.lock
rm -rf node_modules
```

### Chrome Tools 搜索代码里面带有中文

中文必须先转换成 unicode:

```js
function toUnicode(s) {
  return s.replace(/([\u4E00-\u9FA5]|[\uFE30-\uFFA0])/g, function (newStr) {
    return "\\u" + newStr.charCodeAt(0).toString(16);
  });
}

toUnicode("以下数据仅供参考");
// '\\u4ee5\\u4e0b\\u6570\\u636e\\u4ec5\\u4f9b\\u53c2\\u8003'
```