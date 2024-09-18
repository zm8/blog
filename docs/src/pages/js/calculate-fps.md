# 如何计算浏览器的帧率(FPS)

## 导读

FPS 是每秒传输帧数(Frames Per Second)
requestAnimationFrame 的函数

- 传入的回调函数会在浏览器下一次重绘之前执行
- 回调函数执行次数通常是每秒 60 次

## 方式 1

定义一个固定的帧数，帧数 除以 达到这个帧数所需要的时间, 就是帧率:

```js
const getFPS = (callback) => {
  const fpsInterval = 30
  let fpsCount = 0
  let lastTime
  const requestAni = () => {
    if (!lastTime) {
      lastTime = performance.now()
    } else {
      fpsCount++
      if (fpsCount >= fpsInterval) {
        const nowTime = performance.now()
        // 由于performance.now 返回的是 毫秒, 除以 1000, 返回 秒
        const time = (nowTime - lastTime) / 1000
        const fps = Math.round(fpsCount / time)
        lastTime = nowTime
        fpsCount = 0
        callback(fps)
      }
    }
    window.requestAnimationFrame(requestAni)
  }
  window.requestAnimationFrame(requestAni)
}

getFPS((fps) => {
  console.log(fps)
})
```

## 方式 2

使用 requestAnimationFrame 的参数自带的时间戳。

```js
const getFPS = (callback) => {
  let start
  const requestAni = (timestamp) => {
    if (start === undefined) {
      start = timestamp
    } else {
      const elapsed = (timestamp - start) / 1000
      const fps = Math.round(1 / elapsed)
      start = timestamp
      callback(fps)
    }
    window.requestAnimationFrame(requestAni)
  }
  window.requestAnimationFrame(requestAni)
}

getFPS((fps) => {
  console.log(fps)
})
```
