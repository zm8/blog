# 常用的命令

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
