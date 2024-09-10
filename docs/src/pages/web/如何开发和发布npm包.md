# 如何开发和发布 npm 包

### 1. 外网举例(只需 4 步)

1. 注册 npm 账号
   去 npm 官网 https://www.npmjs.com/ 注册。
2. 本机登录 npm

```
> npm config set registry https://registry.npmjs.org #重置拉包源
> npm login #登录, 输入注册好之后的用户名, 密码, 自己的邮箱。
```

3. 新建 package.json 和 index.js 文件

```
// package.json, 注意 main 字段指向index.js
{
  "name": "sino-util-test",
  "version": "1.0.0",
  "main": "index.js",
  "license": "MIT"
}

// index.js
export const sinoTest ='sino-test';
```

4. 发布包
   `> npm publish`

### 2. 相关知识

1. 拉包源地址(npm install 用到)

```
// 获取地址
> npm config get registry
// 设置地址
> npm config set registry https://xxx.yyy.zzz
// 临时使用的拉包源
> npm install xxx --registry=https://registry.npm.taobao.org/
```

2. 发包源地址(npm publish 用到)
   默认发包源地址和拉包源地址相同, 但是也可以指定成不同的。

```
// 配置package.json
{
    ...
    "publishConfig": {
        "registry": "http://xxx.yyy:8081/repository/npm-internal/"
    },
}
// 或使用命令
>npm publish xxx --registry=https://registry.npm.taobao.org/
```

### 3. 内网发包

注意拉包源和发包源是不一样的。
内网包的地址: http://xxx.yyy:8081/#browse/browse:npm-internal

1. 设置拉包源地址。
   安装包时会先从内部仓库寻找，如果没有找到，再从 npm 公网仓库上找
   `> npm set registry http://xxx.yyy:8081/repository/npm-all/`
2. 登录发包源。用户名：frontend，密码：Fs123456，邮箱: 自己公司的邮箱
   `> npm login --registry=http://xxx.yyy:8081/repository/npm-internal/`
3. 新建 package.json 和 index.js 文件。
   package.json 配置发包源

```
{
    ...
    "publishConfig": {
        "registry": "http://xxx.yyy:8081/repository/npm-internal/"
    }
}
```

4. 发布 `> npm publish`
5. 发布后查看的地址: http://xxx.yyy:8081/#browse/browse:npm-internal

### 4. lerna

#### 1. 什么是 lerna?

lerna 使用 git 和 npm 管理多包存储库。
为什么需要多包? 比如我们想要所有的包都统一管理。统一安装依赖，比如 babel 进行转换成 ES5。

#### 2. 如何让你的包都在同一个目录下。

我们平时创建 package.json 的 name 的时候, 是不能有 '/'' 线的, 除非开头是 '@'。
为了让所有的包都归结到一个 namespace 下面, 则前缀必须是 @xxx/yyy-zzz

#### 3. 不使用 lerna 如何创建多个包?

得建一个个包目录, 然后每个目录进去进行 yarn, 发布包的时候 得执行多次 npm publish。

#### 4. 如何使用 lerna

1. yarn init -y # 初始化 package.json
2. yarn add lerna -D # 安装 learn
3. yarn lerna init --independent # 初始化 lerna, independent 是为了让每一个包单独发布版本
4. 修改 lerna.json 和 package.json, 使用 yarn 来安装包和使用 workspaces

```
// lerna.json
{
  ...
  "npmClient": "yarn",
  "useWorkspaces": true,
}
// package.json
{
  ...
  "private": true,
  "workspaces": [
    "packages/*"
  ],
}
```

5. `yarn lerna create @test-sino/test-1` // 创建一个 package
6. `yarn lerna create @test-sino/test-2` // 创建另外一个 package
7. `npx lerna add lodash` // 2 个包都添加 lodash, yarn 命令添加不成功, 所以使用了 npx 替换
8. 修改 2 个包的 package.json 的 publishConfig 的 registry 为 `http://xxx.yyy:8081/repository/npm-internal/`
9. git 提交所有的代码
10. `npx lerna publish` // 发布

#### 6. lerna 优点

    1) 安装包的时候可以统一安装。目录文件清晰。
    2) 发布前会自动创建tag, 类似我们生产发布 Jenkins 打个tag。
    3) 发布的时候会让你自动选择增加版本号。
    4) 另外每次 publish 的时候它会自动修改版本号，完成1次git 提交，然后才发布。

#### 7. lerna 缺点

    1) 如果某个包上面只是改了 README, 没有改 JS 代码, 那么 lerna publish 的时候也会让你发布这个包。
    2) lerna不能只移除指定包的指定依赖，只能移除所有的依赖，如果要移除，只能去特定的包下面手动用 yarn 移除。
    3) lerna 包发布失败的话，会修改 package.json 的版本号，这个时候又需要你手动 git 提交一次 或者撤销本地修改。

### 5. 发包注意事项

1. yarn.lock 必须上传!!!
2. 注意 dependencies, devDependencies, peerDependencies 区别。
3. 使用 ts 来编写，并且代码一定要转换成 ES5。因为箭头函数, Promise 等, IE11 竟然都不支持。
4. 可参考内部包的代码库: http://192.168.1.6:8088/sino-npm/sino-internal

参考 package.json 下面的 build 和 release 写法。

```
// package.json
{
    ...
    "scripts": {
        "test": "jest",
        "test:watch": "jest --watch",
        "build": "lerna exec --scope @sino/* -- yarn build",
        "release": "lerna bootstrap && yarn build && lerna publish"
    },
    ...
}
```

### 参考命令汇总:

```
> npm config set registry http://xxx.yyy:8081/repository/npm-all/
> npm config set registry https://registry.npmjs.org
> npm config set registry https://registry.npm.taobao.org/
> npm config get registry
> npm logout --registry=https://registry.npmjs.org
> npm whoami --registry=https://registry.npmjs.org
> npm config list       # 可以获取到上面登录的配置的地址 /Users/zhengming/.npmrc
```

```
# 添加所有package中的依赖
>lerna add dep-name

# 移除所有package中的依赖
> lerna exec -- yarn remove dep-name

# 给指定package中添加依赖
> lerna add dep-name --scope module-a

# 移除指定package中的依赖
lerna目前并没有remove这种命令，需要去指定的包移除命令

# 添加互相依赖
> lerna add @test-sino/test-1 --scope @test-sino/test-2

# 移除依赖
> lerna exec -- yarn remove lodash // 移除lodash
```
