# `path.join`和`path.resolve`的区别

- `path.join` 方法使用平台特定的分隔符[Unix 系统是/，Windows 系统是\ ] 把给定的片段连接起来
- `path.resolve` 则会把它们解析成绝对路径。

```bash
path.join('a', 'b');     # 'a/b'
path.resolve('a', 'b');  # '/Users/zhengming/git_sino/activity/a/b'
path.join('/a', 'b');    # '/a/b'
path.resolve('/a', 'b'); # '/a/b'

# 末尾的 '/' 符号, path.resolve 会去掉, 而 path.join 不会
path.join('a', 'b/');          # 'a/b/'
path.resolve('a', 'b/');       # '/Users/zhengming/git_sino/activity/a/b'
```
