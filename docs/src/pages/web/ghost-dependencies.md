# 幽灵依赖问题

## npm 安装包的问题

最早 npm 安装包的时候是个文件结构，而文件结构是个树结构，就会导致一些重复的包，比如下面的 `D`, 项目上了规模, 重复的包会大量占用磁盘空间。

<img width="315" alt="image" src="https://github.com/user-attachments/assets/1e90831e-1a5d-4d1a-94f2-a4c51b6df57c">

## yarn 安装包的问题

它把安装包拍扁, 通通放到 `node_modules` 的根目录下。虽然解决了 npm 包安装占用磁盘空间的问题, 但是却产生了幽灵依赖问题。

<img width="342" alt="image" src="https://github.com/user-attachments/assets/36a5ffc0-2889-4122-8b0f-4790ca84d252">

比如我只安装 `vue`, 那么假设 `vue` 依赖 `lodash`, 那么 `lodash` 也会安装到 `node_modules` 的根目录下, 这时代码里面引入 lodash 而不会报错。

但是当某天 `vue` 升级了 v2, 它依赖的 `lodash` 也升级到 v2 版本, 那么可能造成引入 `lodash` 的某些方法报错了。

## pnpm 解决的问题

核心思想是把所有的包存到一个仓库文件里面，然后在 `node_modules` 里面就用正常的树结构表达我们的依赖, 看上去好像有重复项，但是它使用了链接的方式链接到仓库，它并不占用空间。

<img width="755" alt="image" src="https://github.com/user-attachments/assets/ee30332e-e899-4b8c-89a6-039c0487422a">

### `硬链接` 和 `软链接`

`硬链接`是 2 个文件共用一个磁盘空间, `A` 和 `B` 的指针都指向同一个磁盘空间。 如果干掉了文件 `A`, 它不会影响文件 `B`, 互不影响。

`软连接` 类似于快捷方式。比如文件 `A` 创建好了之后指向一块磁盘空间, 通过 `A` 创建了一个软链接 `B`, `B` 的指针指向的是文件 `A`, 而不是指向磁盘空间, 相当于 `B` 是 `A` 的快捷方式, 那么如果有一天干掉 `A`, 那么 `B` 就不能用了。

<img width="591" alt="image" src="https://github.com/user-attachments/assets/5f1aa892-5967-427d-9310-936e757326f5">
