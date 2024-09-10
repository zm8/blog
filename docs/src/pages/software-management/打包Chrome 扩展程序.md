# 打包 Chrome 扩展程序

## 第一种方法

1. 找到扩展程序的外层目录

```bash
> cd /Users/zhengming/Library/Application\ Support/Google/Chrome/Profile\ 4/Extensions/
```

2. 找到扩展 ID 地址, 拷贝这个目录文件夹

```bash
> cd ./bhlhnicpbhignbdhedgjhgdocnmhomnp/
> open ./
```

3. 在 `chrome://extensions/` 下, 点击按钮 "加载已解压的扩展程序"

<img width="1224" alt="image" src="https://github.com/user-attachments/assets/e3f8e3da-5680-4f0e-8a2c-ee6b25c97803">

## 第二种方法

1. 找到扩展程序的外层目录

```bash
> cd /Users/zhengming/Library/Application\ Support/Google/Chrome/Profile\ 4/Extensions/
```

2. 找到扩展 ID 地址:

```bash
> cd ./bhlhnicpbhignbdhedgjhgdocnmhomnp/4.1_0
> pwd
```

3. 拷贝扩展 ID 地址:

```bash
> pwd
/Users/zhengming/Library/Application Support/Google/Chrome/Profile 4/Extensions/bhlhnicpbhignbdhedgjhgdocnmhomnp/4.1_0
```

5. 打包扩展程序

6. 拷贝 xxx.ctx 和 xxx.pem 文件

7. 把 .ctx 文件拖到 Chrome 扩展程序里
