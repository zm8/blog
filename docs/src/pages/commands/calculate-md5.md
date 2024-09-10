# 计算文件或者字符串的 md5 值

## 1: mac 计算文件的 md5

```bash
> md5 1.js
```

## 2. mac 计算字符串的 md5

```bash
> md5 -s "Hello"
```

## 3.linux 计算文件的 md5

```bash
> md5sum 1.js
```

## 4.nodejs 计算文件的 md5

```js
const fs = require('fs')
const crypto = require('crypto')

function md5File(path) {
  return new Promise((resolve) => {
    var rs = fs.createReadStream(path)
    var hash = crypto.createHash('md5')
    rs.on('data', (chunk) => {
      hash.update(chunk)
    })
    rs.on('end', function () {
      resolve(hash.digest('hex'))
    })
  })
}

md5File('./1.js').then((data) => {
  console.log(data)
})
```
