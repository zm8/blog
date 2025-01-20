# 常见异常问题解决

## curl 连接网络的问题

curl 的时候如果出现下面的错误:

```bash
curl: (7) Failed to connect to 127.0.0.1 port 4781 after 0 ms: Couldn't connect to server
```

解决方式:

`curl` 有一个配置文件 `~/.curlrc`, 删除里面的内容 `socks5 = "127.0.0.1:4781"`

## Chrome Tools 搜索代码里面带有中文

中文必须先转换成 unicode:

```js
function toUnicode(str) {
  return str
    .split('')
    .map(char => '\\u' + char.charCodeAt(0).toString(16).padStart(4, '0'))
    .join('');
}


toUnicode("以下数据仅供参考");
// '\u4ee5\u4e0b\u6570\u636e\u4ec5\u4f9b\u53c2\u8003'
```

解释:

- `str.split('')`：将字符串分割为单个字符的数组。
- `char.charCodeAt(0)`：获取每个字符的 Unicode 编码。
- `.toString(16)`：将编码转换为 16 进制字符串。
- `.padStart(4, '0')`：保证每个 Unicode 值长度为 4 位，前面补零。
- `\\u`：每个字符的 Unicode 表示以 `\u` 开头。
- `.join('')`：将结果数组合并成一个完整的字符串。

## Ant design 上传大文件(也就 100 多 k)，服务器报 500 错误

本地开发环境大文件没问题 OK, 但是代码上到开发和测试环境 大文件报 500 错误。

虽然已经设置允许跨域了，但是控制台提示是跨域问题。

真正原因是文件目录的访问权限的问题，得让运维同学配置`nginx`的 `client_body_temp_path(/var/lib/nginx)` 的目录有写的权限。

## win10 上安装完 pnpm, 执行`pnpm -v`，显示不是内部或外部命令

```bash
npm list -g --depth 0 // 查看 pnpm 安装到哪里了
```

如果安装到了 `D:\UserData\13501697816\AppData\Roaming\npm`，则把它加入到 win10 的环境变量里。
最后再执行 `pnpm -v` 就好了。

## 家里的 Mac Air 添加 xing 的权限

```bash
ssh-keygen -o -f ~/.ssh/id_rsa
ssh-keygen -o -t rsa -b 4096 -C "zhengming@fosun.com"
```

## SSH key 添加完，github 拉代码失败

```
Error: Permission denied (publickey)
```

First, check to see if your `~/.ssh/config` file exists in the default location.

```bash
$ open ~/.ssh/config
> The file /Users/you/.ssh/config does not exist.
```

If the file doesn't exist, create the file.

```bash
touch ~/.ssh/config
```

Open your `~/.ssh/config file`, then modify the file to contain the following lines. If your SSH key file has a different name or path than the example code, modify the filename or path to match your current setup.

```
Host *
  AddKeysToAgent yes
  UseKeychain yes
  IdentityFile ~/.ssh/id_ed25519
```

:::tip 参考地址
<https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent>
:::

## 如何查看自己在 github 的全部评论

```bash
commenter:zm8
```

## env: node: No such file or directory

每次启动 terminal 给的烦人的提示。

```bash
sudo chown -R $(whoami) $(brew --prefix)/*
brew link --overwrite node
```

:::tip 参考地址
<https://github.com/nvm-sh/nvm/issues/1702>

<https://stackoverflow.com/questions/14527521/brew-doctor-says-warning-usr-local-include-isnt-writable/14539521#14539521>
:::

## 跨域情况下前端 js 拿不到返回头字段

默认跨域的情况只能拿到以下首部: (Chrome 会多一个 `Content-Length` 首部)

```
Cache-Control
Content-Language
Content-Type
Expires
Last-Modified
Pragma
```

若想拿到首部 `Date`, 则必须服务端设置返回头 **`Access-Control-Expose-Headers: Date`**。
这样前端通过 js 就可以拿到首部 `Date`

```javascript
fetch("http://localhost:44441/").then((res) => {
  for (let [key, value] of res.headers) {
    console.log(key, value);
  }
  return res.text();
});

/*
    cache-control no-cache, no-store
    content-language en-US
    content-length 642
    content-type text/html
    expires Thu, 01 Jan 1970 00:00:01 GMT
    last-modified Fri, 03 Jul 2020 06:11:02 GMT
    pragma no-cach
    date Fri, 03 Jul 2020 07:50:08 GMT
*/
```

## Sourcetree 在 Mac 下 git pre-commit 钩子无法使用 node 问题解决

```js
// 显示 /usr/local/opt/nvm/versions/node/v10.16.0/bin/node
> which node
// 最上面输入: PATH="/usr/local/opt/nvm/versions/node/v10.16.0/bin/node"
> vim .git/hooks/pre-commit
```

## 小程序编译报错 - `unknown: Unexpected character '​'`

如果编译的时候报错如下，那是代码有个地方编码出了问题，使用 Sublime 打开，可以看到多了一个字符。

<img width="584" alt="image" src="https://github.com/zm8/blog_old/assets/32337542/07973333-cffd-4174-bd9d-1a7e3d8351f1">

<img width="670" alt="image" src="https://github.com/zm8/blog_old/assets/32337542/c7f1f514-26bc-4b03-aa73-83cf75f5e3c4">
