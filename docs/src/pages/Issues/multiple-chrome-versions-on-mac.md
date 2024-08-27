1. 先下载一个旧版本 `Chrome`
2. 拖到应用程序，选择保留 2 者, 重命名为 `Google Chrome 8888 No Open.app`
3. 新建一个脚本 `.sh`

```bash
> cd Desktop/
> touch Google_Chrome_8888.sh
> vim Google_Chrome_8888.sh
```

4. 粘贴下面的内容

```bash
#!/usr/bin/env bash
/Applications/Google\ Chrome\ 8888\ No\ Open.app/Contents/MacOS/Google\ Chrome --user-data-dir="/Users/zhengming/Library/Application Support/Google/Chrome8888"
```

5. 赋予脚本可执行权限

```bash
> chmod +x Google_Chrome_8888.sh
```

6. 重命名为 Google_Chrome_8888.sh 为 Google Chrome 8888, 并且把它放到 Application 下面, 以后双击它就可以使用了

7. 如果需要修改 app 头像, 则打开 原版 chrome 的显示简介, 复制 icon 到 Google Chrome 8888 No Open.app 的显示简介里。

::: tip 参考链接

https://zhoukekestar.github.io/notes/2017/11/01/install-multi-chrome.html

https://stackoverflow.com/questions/3785991/can-i-run-multiple-versions-of-google-chrome-on-the-same-machine-mac-or-window

https://zhoukekestar.github.io/notes/2017/11/01/install-multi-chrome.html
:::
