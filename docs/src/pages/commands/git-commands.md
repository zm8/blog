# git 常用命令

## git 贮藏

如果多个项目并行的时候，代码还没提交，但是要切分支，可以使用 git 命令：`git stash`

```bash
git stash  #(贮藏)
git stash apply #(取出贮藏，但是"不删除"贮藏)
git stash pop #(取出贮藏, 但是会"删除"贮藏)
```

在 sourceTree 中操作如下：
![image](https://user-images.githubusercontent.com/32337542/223653997-6f0462d3-d4b3-4067-be4d-113a318044eb.png)

## 建立新分支

```bash
#新建本地分支, 默认关联了 origin/master
git checkout -b test/xxx origin/master;

#新建同名的远端分支, 并且关联本地分支
git push -u origin test/xxx;
#或
git push --set-upstream origin test/xxx;
```

## git add 后想撤销

```bash
> git reset #撤销所有
> git reset test.js  #只撤销 test.js
```

## git commit 后想撤销

```bash
> git reset --soft HEAD^  #撤销commit，不撤销git add
> git reset --mixed HEAD^   #撤销commit，并撤销git add
```

## 修改本地分支与远端分支名字

```bash
git checkout oldBranch;  #切到旧分支
git branch -m newBranch; #重命名分支
git push --delete origin oldBranch; #删除远端旧分支
git push origin newBranch; #本地分支推送到远端
git branch --set-upstream-to origin/newBranch; #修改后的本地分支与远程分支关联
```

## 其它命令

### 修改远端的库

```bash
git remote set-url origin http://xxx:password@git.yyy.com.cn/xxx.git
```

### 查看本地分支和远程分支的关联关系

```bash
git branch -vv
```

### 修改本地分支名字

```bash
git branch -m newBranch
```

### 修改其它分支名字

```bash
git branch -m oldBranch newBranch
```

### 建立本地分支与远程分支的映射关系

```bash
> git branch -u origin/xxx
#或
> git branch --set-upstream-to origin/xxx
```

### 撤销本地分支与远程分支的映射关系

```bash
git branch --unset-upstream
```

### 删除本地分支

```bash
git branch -D xxx
```

### 删除远端分支

```bash
git push origin --delete xxx
#或
git push origin :xxx
```
