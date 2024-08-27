# mac 里的 git ssh 配置

### 一、查看是否已配置

把 id_rsa.pub 的内容拷贝到 GitLab SSH keys 里的 `add key`

```bash
> cd ～/.ssh           #进入ssh目录
> git config --list    #检查下是否配置过git账户
> ls # 查看是否有 id_rsa 和 id_rsa.pub
> cat id_rsa.pub
```

### 二、生成配置

```bash
> git config --global user.name "account name"
> git config --global user.email "account email"
> ssh-keygen -t rsa -C "account email"   # 按3次回车, 生成秘钥
> cat id_rsa.pub
```
