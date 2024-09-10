# 名词解释

## SSG

Static site generator, [静态站点生成器](https://en.wikipedia.org/wiki/Static_site_generator)

## Monorepo（单体仓库）

Monorepo (monolithic[ˌmɒnəˈliθik] repository[rɪˈpɑzəˌtɔri])（单一代码库）是一种管理多个项目或包的代码库结构。与传统的每个项目一个独立仓库的做法不同，monorepo 将多个相关的项目或包集中在一个代码库中。

发音: “摩”（mo）“诺”（no）“瑞”（re）“坡”（po）

优点：

- 共享代码和依赖更方便。
- 更容易统一管理和发布版本。
- 跨项目更容易协作和复用代码。

缺点：

- 随着项目数量增加，代码库会变得庞大，可能需要更复杂的工具和流程来管理。

## pnpm

pnpm 通过从全局 store 硬连接到 node_modules/.pnpm，然后通过软链接来组织依赖关系。

```
my-project/
├── node_modules/
│   ├── lodash -> .pnpm/lodash@4.17.21/node_modules/lodash/ (软链接)
│   └── .pnpm/
│       ├── lodash@4.17.21/
│       │   └── node_modules/
│       │       └── lodash/ (硬连接到全局 store)
└── ... (其他项目文件)
```

## 幽灵依赖问题（Ghost Dependencies）

在依赖管理中，幽灵依赖是指一个项目间接依赖于某些依赖项，而没有在项目的配置文件（如 package.json）中显式声明。这样会导致：

- 依赖关系混乱，难以维护。
- 项目在不同环境或团队成员间可能表现不一致，因为这些未声明的依赖可能存在或不存在。

## 硬连接（Hard Link）

硬连接是一种文件系统对象，它直接指向存储在磁盘上的数据块。创建一个硬连接就相当于给同一个文件取了多个名字，每个名字都可以独立访问同一数据。删除其中一个硬连接，数据并不会被删除，只有当所有的硬连接都被删除后，数据才会从磁盘上移除。
特点：

- 硬连接指向相同的数据块，因此多个硬连接共享相同的文件内容。
- 删除一个硬连接，不会影响其他硬连接访问同一文件。
- 硬连接不能跨文件系统。

## 软链接（符号链接，Symbolic Link）

软链接是一种特殊的文件，内容是指向另一个文件或目录的路径。打开软链接文件时，系统会自动重定向到目标文件或目录。

特点：

- 软链接类似于快捷方式，指向目标文件或目录的路径。
- 删除软链接不会影响目标文件或目录，但删除目标文件或目录会导致软链接变成“悬空链接”（dead link）。
- 软链接可以跨文件系统。

## 创建硬链接和软链接

硬连接的文件共享一个数据, 修改其中一个文件的内容, 另外一个文件也会变化。
软链接类似于快捷方式。

### 在 macOS 上创建硬链接和软链接

#### 硬链接（Hard Link）

在 macOS 上，可以使用 ln 命令来创建硬链接。假设你有一个文件 original.txt：

```
echo 'Hello, World!' > original.txt
```

现在，创建一个硬链接 hardlink.txt：

```
ln original.txt hardlink.txt
```

这个命令会创建一个硬链接 hardlink.txt，它和 original.txt 指向相同的数据。你可以验证它们的 inode（文件系统中的唯一标识符）是相同的：

```
ls -i original.txt hardlink.txt  // 8715595886 hardlink.txt	8715595886 original.txt
```

#### 软链接（Symbolic Link）

使用 ln -s 命令来创建软链接。假设你有一个文件 original.txt：

```
ln -s original.txt symlink.txt
```

这个命令会创建一个软链接 `symlink.txt`，它指向 `original.txt`。你可以查看软链接的信息：

```
ls -l symlink.txt  // lrwxr-xr-x  1 zhengming  staff  12  7  3 20:42 symlink.txt -> original.txt
```

你会看到 `symlink.txt -> original.txt` 这样的输出。

### 在 Windows 10 上创建硬链接和软链接

#### 硬链接（Hard Link）

在 Windows 10 上，可以使用 mklink 命令来创建硬链接。首先打开命令提示符（以管理员身份运行），然后假设你有一个文件 `original.txt`：

```
echo Hello, World! > original.txt
```

现在，创建一个硬链接 `hardlink.txt`：

```
mklink /H hardlink.txt original.txt
```

这个命令会创建一个硬链接 `hardlink.txt`，它和 `original.txt` 指向相同的数据。

#### 软链接（Symbolic Link）

使用 mklink 命令来创建软链接。假设你有一个文件 original.txt：

```
mklink symlink.txt original.txt
```

这个命令会创建一个软链接 symlink.txt，它指向 original.txt。
