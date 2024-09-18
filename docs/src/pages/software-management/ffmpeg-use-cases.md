# ffmpeg 解决的问题

1. ffmpeg 压缩 1920 × 1080 到 640 x 360

```js
./ffmpeg -i input.mp4 -vf scale=640:360 video_640.mp4 -hide_banner
```

2. 截取音频文件, 从 `00:04:32` 开始截取 `1` 秒钟

```
./ffmpeg -ss 00:04:32 -t 00:00:01 -i 1.mp3  output_1.mp3
```

::: 参考地址
<https://blog.p2hp.com/archives/5512>
<https://cloud.tencent.com/developer/article/1566587>
:::
