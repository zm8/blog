# git 常用命令

## 建立新分支

```bash
#新建本地分支, 默认关联了 origin/master
git checkout -b test/xxx origin/master;

#新建同名的远端分支, 并且关联本地分支
git push -u origin test/xxx;
#或
git push --set-upstream origin test/xxx;
```

## git add 想撤销

```bash
> git reset #撤销所有
> git reset test.js  #只撤销 test.js
```

## git commit 后撤销

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

### 建立本地分支与远程分支的映射关系:

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
