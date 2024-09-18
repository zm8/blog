# npm 知识学习

## 报错 Fix the upstream dependency conflict

解决方式:

```bash
npm install --legacy-peer-deps
```

## 1. 安装包里的 dependencies 和 devDependencies

假设你安装了 A 包(`yarn add A`), A 包里的 package.json 如下, 那么 devDependencies 其实它是不会安装到 node_modules 里的, 只有 dependencies 会安装到 node_modules 里。

```json
{
  "name": "use-state-pre",
  //...
  "dependencies": {
    "lodash": "^4.17.19"
  },
  "devDependencies": {
    "qs": "^6.9.4"
  }
}
```

## 2. yarn 的镜像问题

yarn 的默认镜像是 `https://registry.yarnpkg.com`, npm 的默认镜像是 `https://registry.npmjs.org`
从测试来看, yarn 默认都是从 npm 的镜像那边下载包的。

1.如果改了 npm 镜像, `npm config set registry xxx`, 那么 yarn 是安装不了包

2.如果改了 yarn 镜像, 而 npm 镜像没改, ``yarn config set registry xxx`, yarn 还是能安装包

如果要使用临时的 registry, 可以执行:

```bash
yarn add lodash --registry=https://registry.npmjs.org
```

## 3. npm login 登录

1.`npm login` 是 `npm adduser` 的别称。
参考: <https://docs.npmjs.com/cli/adduser>

2.`npm login` 可以指定 registry 进行多次登录。

```bash
npm login --registry=https://registry.npmjs.org
Username: david.zheng
Password:
Email: (this IS public) 280541464@qq.com
```

```bash
npm login --registry=http://xxx/repository/npm-internal/
Username: frontend
Password:
Email: (this IS public) david.zheng@meetsocial.cn
```

执行 `npm config list` 可以获取到上面登录的配置的地址 `/Users/zhengming/.npmrc`

```
; cli configs
metrics-registry = "http://xxx/repository/npm-all"
scope = ""
user-agent = "npm/6.12.1 node/v12.13.1 darwin x64"

; userconfig /Users/zhengming/.npmrc
prefix = "/Users/zhengming/.nvm/versions/node/v12.3.0"
registry = "http://xxx/repository/npm-all"

; node bin location = /Users/zhengming/.nvm/versions/node/v12.13.1/bin/node
; cwd = /Users/zhengming/Desktop/demo/lerna-demo/packages/window
; HOME = /Users/zhengming
; "npm config ls -l" to show all defaults.
```

查看 .npmrc 里面的内容:

```
> cat /Users/zhengming/.npmrc

registry=http://xxx/repository/npm-all
prefix=/Users/zhengming/.nvm/versions/node/v12.3.0
//registry.npmjs.org/:_authToken=yyy
//xxx:8081/repository/npm-internal/:_authToken=yyy
```

## 4. `npm whoami` 可以查看是谁登录

```
> npm whoami --registry=https://registry.npmjs.org
> david.zheng
```

但是它看不了内网的登录, 会报下面的错误, whoami 在 npm-internal 上找不到。

```
> npm whoami --registry=http://xxx/repository/npm-internal/

npm ERR! code E404
npm ERR! 404 Not Found - GET http://xxx/repository/npm-internal/-/whoami - Package '--whoami' not found
npm ERR! 404
npm ERR! 404  'whoami' is not in the npm registry.
npm ERR! 404 You should bug the author to publish it (or use the name yourself!)
npm ERR! 404
npm ERR! 404 Note that you can also install from a
npm ERR! 404 tarball, folder, http url, or git url.

npm ERR! A complete log of this run can be found in:
npm ERR!     /Users/zhengming/.npm/_logs/2020-09-15T04_06_03_001Z-debug.log
```

## 5. npm logout

用户退出登录; 默认退出的是 `npm config get registry` 的地址。
当然可以指定 registry 退出登录。

```bash
npm logout --registry https://registry.npmjs.org
```

## 6. npm registry

只能设置一个, 当设置能公司内网地址的时候 `http://xxx/repository/npm-all`,
这时可以**不需要登录**, 就能从公司内网获取相应的包。
而用 `npm login` 登录用户, 只是为了**有权限** `npm publish` 上传包和 `npm unpublish` 卸载包。

## 7. npm publish 发包

**直接在 package.json 的目录地址的控制台执行 `npm publish` 就能发这个包了**。
推送包的默认地址是 `npm config get registry` 的地址
推送包的地址也可以在 package.json 配置:

```json
{
  // ...
  "publishConfig": {
    "registry": "https://registry.npmjs.org/"
  }
}
```

## 8. npm unpublish 卸载包

默认地址是 `npm config get registry` 的地址

```bash
npm  unpublish sino-window@1.0.1
```

unpublish 包的地址配置不能在 package.json 里配置, 只能在命令里面自己指定, 比如:

```bash
npm  unpublish sino-window@1.0.1 --registry=https://registry.npmjs.org
```

## 9. 其他

### 1. 版本号格式

比如 1.2.3 代表： 主版本号.次版本号.修订号

- 主版本号：当你做了不兼容的 API 修改；
- 次版本号：当你做了向后兼容的功能性新增；
- 修订号：当你做了向后兼容的问题修正；

### 2. `^` 和 `~` 的区别

#### `^` 是兼容性版本

可以简单理解成大于等于当前版本，并且小于左边不为 0 的数字 +1

- ^1.2.3 : >=1.2.3 <2.0.0
- ^0.2.3 : >=0.2.3 <0.3.0
- ^0.0.3 : >=0.0.3 <0.0.4

#### `~` 补丁版本号升级

- ~1.2.3: >=1.2.3 <1.3.0
- ~0.2.3: >=0.2.3 <0.3.0
- ~1.2 : >=1.2.0 <1.3.0 (Same as 1.2.x)

### 3. yarn.lock

yarn.lock 必须上传, 因为它有锁定版本号的功能, 里面的 version 字段就是当前的版本号。
resolved 是包的缓存地址。

```
"@ant-design/colors@^3.1.0":
	version "3.2.2"
	resolved "https://registry.yarnpkg.com/@ant-design/colors/-/colors-3.2.2.tgz#5ad43d619e911f3488ebac303d606e66a8423903"
	integrity sha512-YKgNbG2dlzqMhA9NtI3/pbY16m3Yl/EeWBRa+lB1X1YaYxHrxNexiQYCLTWO/uDvAjLFMEDU+zR901waBtMtjQ==
	dependencies:
		tinycolor2 "^1.4.1"
```

::: 参考地址

<https://stackoverflow.com/questions/22343224/whats-the-difference-between-tilde-and-caret-in-package-json>

<http://buzhundong.com/post/%E7%89%88%E6%9C%AC%E5%8F%B7%E7%AE%A1%E7%90%86%E7%AD%96%E7%95%A5-%E4%BD%BF%E7%94%A8npm%E7%AE%A1%E7%90%86%E9%A1%B9%E7%9B%AE%E7%89%88%E6%9C%AC%E5%8F%B7.html>

<https://docs.npmjs.com/files/package.json>

<https://docs.npmjs.com/misc/semver>

<https://juejin.im/post/6844903981668368392>

:::
