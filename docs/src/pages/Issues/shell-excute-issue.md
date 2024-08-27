# Shell 文件执行报错

假设有下面的 scope.sh, 在控制台执行 bash ./scope.sh 会报错，

```bash
#!/bin/bash
function hello () {
    echo "Hello world"
}

#call this function as follow:
hello   # Syntax Correct
```

报错如下:

```
'/scope.sh: line 2: syntax error near unexpected token `{
'/scope.sh: line 2: `function hello () {
```

### 原因:

因为 MS-DOS 及 Windows 是回车＋换行来表示换行，因此在 Linux 下用 Vim 查看在 Windows 下用 VC 写的代码，行尾后的“^M”符号，表示的是符。

### 解决方案:

把 ^M 替换为空字符串

```bash
> vim -b scope.sh
// vim 的 -b 选项是告诉 Vim 打开的是一个二进制文件
> shift+: // 进入 编辑模式
> %s/<Ctrl-V><Ctrl-M>/\r/g
```

对于 `**%s/<Ctrl-V><Ctrl-M>/\r/g**` 的理解:

1. `%` = `all lines`
2. `<Ctrl-V><Ctrl-M> = ^M`
   the Ctrl-V is a Vim way of writing the Ctrl ^ character and Ctrl-M writes the M after the regular expression, resulting to ^M special character
3. `\r` = `new line` 新的一行
4. `g` = `do it globally`

::: tip 参考链接
https://stackoverflow.com/questions/811193/

how-to-convert-the-m-linebreak-to-normal-linebreak-in-a-file-opened-in-vim

https://blog.csdn.net/xyp84/article/details/4435899
:::
