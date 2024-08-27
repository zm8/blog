# win10 配置 https 生成证书

建议先安装 https://cmder.net, 一个类 Linux 的终端。

### 1. 生成 root 证书 RootCA.pem, RootCA.key 和 RootCA.crt

若 win10 执行出错, 建议把 `-subj "/C=CN/CN=Example-Root-CA"` 去掉，自己输入 CN。

```bash
openssl req -x509 -nodes -new -sha256 -days 1024 -newkey rsa:2048 -keyout RootCA.key -out RootCA.pem -subj "/C=CN/CN=Example-Root-CA"
```

```bash
openssl x509 -outform pem -in RootCA.pem -out RootCA.crt
```

### 2. 配置 host 文件

```bash
127.0.0.1 david.meetsocial.cn
```

### 3. 新建文件 domains.ext(win10 必须打勾显示扩展名), 下面的域名可以配置多个。

```
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names
[alt_names]
DNS.1 = localhost
DNS.2 = david.meetsocial.cn
DNS.3 = sino.meetsocial.cn
```

### 4. 执行如下命令, 生成 localhost.key, localhost.csr 和 localhost.crt

```bash
openssl req -new -nodes -newkey rsa:2048 -keyout localhost.key -out localhost.csr -subj "/C=CN/ST=YourState/L=YourCity/O=Example-Certificates/CN=localhost.local"
```

```bash
openssl x509 -req -sha256 -days 1024 -in localhost.csr -CA RootCA.pem -CAkey RootCA.key -CAcreateserial -extfile domains.ext -out localhost.crt
```

### 5. 双击文件 RootCA.crt, 导入的时候得选择 "受信任的根证书颁发机构"。

![image](https://user-images.githubusercontent.com/32337542/77903898-378fb280-72b6-11ea-9e5d-ccd710f4d026.png)

### 6. 在需要的地方使用 localhost.key, localhost.crt。

比如 umijs, 把上面 2 个文件放入新建文件夹 credentials 里, 然后执行下面的命令

```bash
"start:test": cross-env HTTPS=true CERT=./credentials/server.crt KEY=./credentials/server.key UMI_ENV=test umi dev
```

:::tip 参考地址
https://gist.github.com/cecilemuller/9492b848eb8fe46d462abeb26656c4f8
:::
