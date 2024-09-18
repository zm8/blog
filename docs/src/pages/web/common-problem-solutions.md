# 常见问题解决整理

### win10 上安装完 pnpm, 执行`pnpm -v`，显示不是内部或外部命令

```
> npm list -g --depth 0 // 查看 pnpm 安装到哪里了
```

如果安装到了 `D:\UserData\13501697816\AppData\Roaming\npm`，则把它加入到 win10 的环境变量里。
最后再执行 `pnpm -v` 就好了。

### 家里的 Mac Air 添加 xing 的权限

```
`ssh-keygen -o -f ~/.ssh/id_rsa`
ssh-keygen -o -t rsa -b 4096 -C "zhengming@fosun.com"
```

### SSH key 添加完，github 拉代码失败

```
Error: Permission denied (publickey)
```

First, check to see if your `~/.ssh/config` file exists in the default location.

```
$ open ~/.ssh/config
> The file /Users/you/.ssh/config does not exist.
```

If the file doesn't exist, create the file.

```
$ touch ~/.ssh/config
```

Open your `~/.ssh/config file`, then modify the file to contain the following lines. If your SSH key file has a different name or path than the example code, modify the filename or path to match your current setup.

```
Host *
  AddKeysToAgent yes
  UseKeychain yes
  IdentityFile ~/.ssh/id_ed25519
```

参考:
https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent

### 如何查看自己在 github 的全部评论

```
> commenter:zm8
```

### env: node: No such file or directory

每次启动 terminal 给的烦人的提示。

```
> sudo chown -R $(whoami) $(brew --prefix)/*
> brew link --overwrite node
```

参考地址:
https://github.com/nvm-sh/nvm/issues/1702
https://stackoverflow.com/questions/14527521/brew-doctor-says-warning-usr-local-include-isnt-writable/14539521#14539521

### 跨域情况下前端 js 拿不到返回头字段

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

### Sourcetree 在 Mac 下 git pre-commit 钩子无法使用 node 问题解决

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