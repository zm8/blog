# Beyond Compare 无限试用

### 1. Mac

```
> cd "/Applications/Beyond Compare.app/Contents/MacOS/"
> mv BCompare BCompare.real
> touch BCompare
> vim BCompare

#! /bin/bash
if [ -f $HOME/Library/Application\ Support/Beyond\ Compare/registry.dat ]
then
    rm $HOME/Library/Application\ Support/Beyond\ Compare/registry.dat
fi
"/Applications/Beyond Compare.app/Contents/MacOS/BCompare.real" &

> chmod +x BCompare
```

::: 参考地址
https://gist.github.com/njleonzhang/e5b68b9e9e31d7c09731945a336e0310
http://tutandtips.blogspot.com/2015/10/beyond-compare-4-for-mac-unlimited.html
http://www.scootersoftware.com/support.php?zz=kb_evalpro
:::

### 2. Window 10

1: 搜索栏输入 regedit 打开注册表, 删除如下项目:
**计算机\HKEY_CURRENT_USER\SOFTWARE\Scooter Software\Beyond Compare 4\CacheID**

2: 在以下路径删除 BCState.xml 和 BCState.xml.bak
**D:\Users\zhengming809\AppData\Roaming\Scooter Software\Beyond Compare 4**
