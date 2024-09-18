# mac 汇总

## 修改 ~/.bashrc 重启不生效

发现改 `~/.bash_profile` 会始终都生效，而 `~/.bashrc` 每次 terminal 重启后不生效了。

## curl 走代理请求谷歌

```bash
curl https://www.google.com -x socks5h://127.0.0.1:4781
```

始终走代理:

```bash
vim .curlrc
```

填入: `proxy = "socks5h://127.0.0.1:4781"`

## mac 下彻底卸载 node 和 npm

为了用 brew 安装 nvm，再用 nvm 安装 node, 需要彻底删除 node，执行以下命令

```bash
sudo rm -rf /usr/local/{bin/{node,npm},lib/node_modules/npm,lib/node,share/man//node.}
```

### http-server 禁止缓存

```bash
http-server -c-1 ./
```
