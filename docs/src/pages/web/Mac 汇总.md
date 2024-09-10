# Mac 汇总

## 1. 修改 ~/.bashrc 重启不生效

发现改 `~/.bash_profile` 会始终都生效，而 `~/.bashrc` 每次 terminal 重启后不生效了。

## 2. curl 走代理请求谷歌

```cmd
> curl https://www.google.com -x socks5h://127.0.0.1:4781
```

始终走代理:

```cmd
> vim .curlrc
```

填入: `proxy = "socks5h://127.0.0.1:4781"`

## 3. MacOS 系统清理

1. Tencent Lemon
2. OmniDiskSweeper

清除:

```cmd
> rm -rf ~/Library/Caches
```

关注的目录有:
`~/Library/`
`~/Library/Application Support`
`~/Library/Containers`

## 4. Mac 下彻底卸载 node 和 npm

为了用 brew 安装 nvm，再用 nvm 安装 node, 需要彻底删除 node，执行以下命令

```cmd
> $ sudo rm -rf /usr/local/{bin/{node,npm},lib/node_modules/npm,lib/node,share/man//node.}
```

### http-server 禁止缓存

http-server -c-1 ./
