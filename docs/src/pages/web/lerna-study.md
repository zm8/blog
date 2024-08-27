# lerna 学习

1. 每次做 publish 的前, 本地的代码都必须先提交，否则 publish 会不成功。

2. 每次 publish 的版本是根据 lerna.json 里的 version 值, 比如若它是 1.0.5, 发布的时候让你选择 1.0.6 及以上, 其实它和 packages/\* 下各个包的 package.json 里的 version 是没有直接关系的, 但是有间接关系, 其实你可以改动它来发布更加高的版本, 但是不建议直接手动改。

3. lerna.json version 的值, 只能越来越高, 它是根据 packages/\* 所有包的 package.json 的 version 最大值决定。所以当你新增加一个全新的包发布时, 它的 package.json 里的 version 会自动修改成 lerna.json 的 version, 比如有时会是 4.0.0, 这样可读性不是很好，但是易于管理。

4. 可通过命令 `lerna init --independent` 修改模式, 单独发包。不过线上 babel 里面的各个包发布都是统一一个版本号，可能也是为了统一管理吧。 (比如: @babel/core, @babel/code-frame, @babel/generator)

5. lerna 发包的时候会先 git pull , 把所有的 tag 都拉下来, 如果当前发包的 verison 值 tag 里面已经有了, 那么它会提示你发包失败。

6. 若 lerna 改成 independent 模式, 那么每次发包的 tag 会增加一个包名的前缀, 比如: sino-window@2.0.1。

7. lerna updated 会告诉你会发布哪个包。
