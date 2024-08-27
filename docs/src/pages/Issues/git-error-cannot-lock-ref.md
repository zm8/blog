# git 若出现错误 error: cannot lock ref 'xxx'

git 若出现错误 `error: cannot lock ref 'refs/remotes/orgin/examination/190326_xxx_xxx': unable to resolve reference 'refs/remotes/orgin/examination/190326_xxx_xxx': reference token`

尝试执行 `rm -rf .git/refs/remotes/origin/examination/190326_xxx_xxx`, 若不行，则删除整个 `refs`, 命令如下:

```bash
rm -rf .git/refs/
git init
git reset --hard origin/examination/190326_xxx_xxx
git fetch --prun
```
