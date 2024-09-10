# fetch 原生请求下载 excel 方式

### 1. 原生方式

```js
http('xxx/facebook/exportRecordList', {
  startTime: '2020-7-01',
  endTime: '2020-12-31',
  pageNum: 1,
  pageSize: 1000000000,
  companyName: '',
  userId: -99
}).then((res) => exportFile(res))

async function exportFile(res) {
  const blobData = await res.blob() // 注意这里要 await
  const blobUrl = window.URL.createObjectURL(blobData)

  // res.headers 是一个 迭代器, 所以用 get 方式去取 content-disposition
  let filename = res.headers.get('content-disposition').split('filename=')[1]
  filename = filename.substring(1, filename.length - 1)

  const a = document.createElement('a')
  a.href = blobUrl
  a.download = filename
  a.click()
}

function http(url, data = {}) {
  return window.fetch(url, {
    body: JSON.stringify(data),
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8'
    },
    cache: 'no-cache',
    method: 'POST',
    mode: 'cors'
  })
}
```

### 2. axios 方式

1. 控制台先加载 axios

```js
var script = document.createElement('script')
script.src = 'https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js'
document.body.appendChild(script)
```

2. 定义 http 和 httpRes

```js
var axiosCreate = () => {
  var handleError = (error = {}) => {
    // 注意, 如果是跨域请求, 会没有 code
    const { code, response } = error
    if (code === 'ECONNABORTED') {
      // 请求超时
    }
    let obj = {}
    if (response) {
      // 有 response 返回
      const { status, statusText } = response
      obj.code = status
      obj.message = statusText
    } else if (error.toJSON) {
      // 有 toJSON 方法
      const { code, message } = error.toJSON()
      obj.code = code
      obj.message = message
    } else {
      // 默认值
      obj.code = '500'
      obj.message = 'Error: Network Error'
    }
    return Promise.reject(obj)
  }
  const axiosHttp = axios.create({
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'post',
    withCredentials: true,
    responseType: 'json',
    timeout: 5 * 60 * 1000 // 超时时间, 5分钟
  })

  axiosHttp.interceptors.request.use((config) => {
    if (config.method === 'get') {
      // 如果是 get 方法, 则把它赋值给 params
      config.params = JSON.parse(config.data)
      delete config.data
    }
    return config
  }, handleError)

  axiosHttp.interceptors.response.use(
    (res) => res,
    // 注意 error.response 可能为 undefined,
    // 比如跨域请求 https://www.baidu.com/
    handleError
  )

  // 展示错误信息
  axiosHttp.showErrorMsg = () => {}

  // 拦截 response
  axiosHttp.interceptResponse = (res = {}) => {
    const config = res.config || {}
    // 返回 blob 的时候, 没有 code 为0
    if (config.responseType === 'blob') {
      return res
    }
    // 由于 res.data 可能为null, 所以不能用 默认值解构写法: { data = {} } = res
    const data = res.data || {}
    const { code, message } = data
    // 数据返回成功
    if (code === 0) {
      return res
    }
    // 注意这里的 Promise.reject 并不走到 response 的handleError
    return Promise.reject({ code, message })
  }
  axiosHttp.interceptError = () => false
  axiosHttp.send = async (para) => {
    try {
      const res = await axiosHttp.request(para)
      return await axiosHttp.interceptResponse(res)
    } catch (e) {
      if (await axiosHttp.interceptError(e)) return
      await axiosHttp.showErrorMsg(e)
      throw e // 继续抛出错误, 给业务逻辑
    }
  }
  return axiosHttp
}

var axiosHttp = axiosCreate()
axiosHttp.interceptError = (res = {}) => {
  const { code } = res
  // 请求超时
  if (code === 'ECONNABORTED') {
    console.log('Error: request timeout!')
  }
  if (code === 401) {
    redirectLogin()
    return true // 返回 true, 则不显示antd 错误提示框
  }
}

axiosHttp.showErrorMsg = (err) => {
  const { message = 'Network Error!' } = err
  if (document.visibilityState === 'visible') {
    antdMsg.error(`${message}`)
  }
}

var http = (para) => axiosHttp.send(para).then((res) => res.data.result)
var httpRes = (para) => axiosHttp.send(para)
```

3. 控制台, 执行导出代码

```js
var exportReport = (res) => {
  const blob = new Blob([res.data])
  const blobUrl = window.URL.createObjectURL(blob)
  let filename = res.headers['content-disposition'].split('filename=')[1]
  filename = filename.substring(1, filename.length - 1)
  const a = document.createElement('a')
  a.href = blobUrl
  a.download = filename
  a.click()
}
httpRes({
  url: 'xxx/facebook/exportRecordList',
  data: {
    startTime: '2020-7-01',
    endTime: '2020-12-31',
    pageNum: 1,
    pageSize: 1000000,
    companyName: '',
    userId: -99
  },
  responseType: 'blob'
}).then((res) => exportReport(res))
```
