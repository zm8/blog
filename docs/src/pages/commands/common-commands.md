# 常用命令

## VSCode 清除没有引入的 import

```bash
option + shift + o
```

## mac 压缩和解压

```bash
tar -zcvf ../release.tgz . # 压缩到当前目录
tar -zxvf release.tgz -C ./release # 解压到 release 目录
```

## package 里的模块执行

比如要执行 `eslint --init`, 则执行下面的命令:

```bash
./node_modules/.bin/eslint --init
// 或者
pnpm eslint  --init
```

## mac 查看本机 ip

```bash
ipconfig getifaddr en0
```

## mac 查看历史命令

```bash
history
!551 # 执行某个历史命令
```

## mac 杀死一个进程

```bash
lsof -i :7001    # 查看7001端口的进程id
kill -9 78452    # 杀掉进程id
```

## nvm

```bash
nvm install 8.9.4 // 安装版本
nvm use 8.9.4 // 使用哪个版本
nvm alias default 8.9.4 // 默认哪个版本
```

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

## mac 移除压缩文件夹里面的 `__MACOSX` 和 `.DS_Store`

```bash
zip -d 测试.zip "__MACOSX*" "*/.DS_Store"
```

### win10 和 mac 删除文件和文件夹

win10:

```bash
del /f yarn.lock
rmdir /s /q node_modules
```

mac:

```bash
rm -rf yarn.lock
rm -rf node_modules
```
