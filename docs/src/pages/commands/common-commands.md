# 常用的命令

### linux 压缩和解压

```bash
> tar -zcvf ../release.tgz . # 压缩到当前目录
> tar -zxvf release.tgz -C ./release # 解压到 release 目录
```

### package 里的模块执行

比如要执行 `eslint --init`, 则执行下面的命令:

```bash
> ./node_modules/.bin/eslint --init
// 或者
> pnpm eslint  --init
```

### mac 查看本机 ip

`> ipconfig getifaddr en0`

### vscode 打开某个文件

1. `ctrl + shift + p` Open the Command Palette
2. 在 PATH 中安装 'code' 命令
3. vscode 控制台执行命令 `code ~/.gitconfig`

### 查看历史命令

```bash
> history
> !551 # 执行某个历史命令
```
