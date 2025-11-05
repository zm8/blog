# Sourcetree 在 Win11 上拉取代码失败

在使用 Sourcetree 拉取代码时，可能会遇到报错信息：`fatal: argumentException encountered` 或 `认证失败，请确认您输入了正确的账号密码`。这个问题通常是由于之前修改了 Git 的用户名和密码导致的。

## 解决方案

1. 删除 Sourcetree 保存的凭证文件：

   - 路径：`C:\Users\zm25588\AppData\Local\Atlassian\SourceTree\passwd`

   删除该文件后，Sourcetree 拉取代码，会要求你重新输入 Git 的用户名和密码，从而解决认证失败的问题。

2. Sourcetree 菜单"工具-选项-验证"，删除里面所有的 "Git 已存密码"。
