# 常见系统问题和解决方案

今天我来分享一些常见的系统问题和解决方案。

## 1. `curl` 连接网络问题

### 问题描述

使用 `curl` 时，可能会遇到如下错误：

```bash
curl: (7) Failed to connect to 127.0.0.1 port 4781 after 0 ms: Couldn't connect to server
```

### 解决方法

`curl` 的配置文件路径为 `~/.curlrc`。删除该文件中以下内容：

```
socks5 = "127.0.0.1:4781"
```

## 2. Win10 上安装 pnpm 后无法运行

### 问题描述

执行 `pnpm -v` 时，提示不是内部或外部命令。

### 解决方法

1. 运行以下命令，查看 `pnpm` 安装路径：

```bash
npm list -g --depth 0
```

2. 如果安装路径为 `D:\UserData\135****7816\AppData\Roaming\npm`，将其加入到系统环境变量中。

3. 重新执行 `pnpm -v`。

## 3. Mac 添加 SSH 权限

创建 SSH 密钥：

```bash
ssh-keygen -o -f ~/.ssh/id_rsa
ssh-keygen -o -t rsa -b 4096 -C "david@fosun.com"
```

## 4. GitHub 使用 SSH 拉代码失败

### 问题描述

添加 SSH key 后，拉取代码失败并提示：

```
Error: Permission denied (publickey)
```

### 解决方法

1. 检查 `~/.ssh/config` 文件是否存在：

```bash
open ~/.ssh/config
```

2. 如果文件不存在，使用以下命令创建：

```bash
touch ~/.ssh/config
```

3. 编辑 `~/.ssh/config` 文件，添加以下内容（根据实际路径修改）：

```
Host *
  AddKeysToAgent yes
  UseKeychain yes
  IdentityFile ~/.ssh/id_ed25519
```

### 参考

- GitHub 官方文档: <https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent>


## 5. 启动 Terminal 提示 `env: node: No such file or directory`

### 解决方法

1. 更改文件权限：

```
sudo chown -R $(whoami) $(brew --prefix)/*
```

2. 链接 Node.js：

```
brew link --overwrite node
```

### 参考

- [GitHub Issue]：<https://github.com/nvm-sh/nvm/issues/1702>
- [Stack Overflow]：<https://stackoverflow.com/questions/14527521/brew-doctor-says-warning-usr-local-include-isnt-writable/14539521#14539521>

## 6. Mac 下 SourceTree 的 Git pre-commit 钩子问题

### 问题描述

`pre-commit` 钩子无法使用 Node.js。

### 解决方法

1.  检查 Node.js 路径：

```
which node
```

示例输出：

```
/usr/local/opt/nvm/versions/node/v10.16.0/bin/node
```

2. 在 `pre-commit` 文件顶部添加以下内容：

```
PATH="/usr/local/opt/nvm/versions/node/v10.16.0/bin/node"
```

## 7. Shell 文件执行报错及解决

### 问题描述

假设存在以下 `scope.sh` 文件，执行 `bash ./scope.sh` 时会报错：

```
#!/bin/bash
function hello () {
    echo "Hello world"
}

#call this function as follow:
hello   # Syntax Correct
```

报错信息如下：

```
'/scope.sh: line 2: syntax error near unexpected token `{
'/scope.sh: line 2: `function hello () {
```

### 问题原因

该问题通常发生在使用 Windows 系统创建的文件，在 Linux 系统上执行时。

原因在于 Windows 的换行符是 **回车 + 换行** (`\r\n`)，而 Linux 使用的是 **换行** (`\n`)。

因此，文件中多余的 `^M` 符号（表示回车字符 `\r`）导致了语法错误。


### 解决方案

使用 Vim 移除 `^M`

1. 打开文件：

vim 的 -b 选项是告诉 Vim 打开的是一个二进制文件

```bash
vim -b scope.sh
```

2. 进入命令模式：

```
shift + :
```

3. 替换所有的 `^M` 为新行符 `\r`：

```
%s/<Ctrl-V><Ctrl-M>/\r/g
```

**解释**：

- `%`：表示作用于所有行。
- `<Ctrl-V><Ctrl-M>`：插入控制字符 `^M`。
- `\r`：表示新行符。
- `g`：表示全局替换。

### 参考

- <https://stackoverflow.com/questions/811193/>
- <https://blog.csdn.net/xyp84/article/details/4435899>

## 最后

> 点赞👍 + 关注➕ + 收藏❤️ = 学会了🎉。
>
> 更多优质内容关注公众号，@前端大卫。
