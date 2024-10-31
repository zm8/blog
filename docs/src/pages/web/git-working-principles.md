# Git 工作原理

<img width="650" alt="image" src="https://github.com/user-attachments/assets/c6cb7293-49cb-4625-8350-3b7e405f9553">

## 1.工作目录（Working Directory）

就是你能直接看到和编辑的项目文件夹，直接存储在硬盘上，以普通文件的形式存在。

## 2.暂存区（Staging Area）

也叫"索引"(index)，是一个中间区域，用来准备下一次提交。

位置: 存储在 `.git/index`

## 3.本地仓库（Local Repository）

存储你的所有版本历史，包含所有的提交记录、分支信息等。

位置: `.git/objects/`（存储所有的 git 对象）

## 4.远程仓库（Remote Repository）

位于远程服务器上，不在你的本地硬盘上，需要网络连接才能访问。
