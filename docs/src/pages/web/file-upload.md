# 文件上传功能

```html
<!DOCTYPE html>
<head>
  <meta charset="utf-8" />
  <title>test</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>

<body>
    <input type="file" id="inp-upload" accept="image/*" >
    <script>
        document.getElementById('inp-upload').addEventListener('change', function(){
            var file = this.files[0];
          var data = new FormData();
          data.append("file", file);
          var xhr = new XMLHttpRequest();
          xhr.open("POST", "http://h5api-dev.foo.cn/upload");
          // 上传完成后的回调函数
          xhr.onload = function() {
            console.log('onload', xhr.readyState);
            if (xhr.readyState === 4) {
              try{
                var data = JSON.parse(xhr.responseText);
                if(data.code === 0){
                  console.log('上传成功', data)
                }
              }catch(e){
                console.log('上传失败', e);
              }
            }
          };
          xhr.onerror = function(){
            console.log('上传错误');
          }
          // 获取上传进度
          xhr.upload.onprogress = function(event) {
            if (event.lengthComputable) {
              var percent = Math.floor((event.loaded / event.total) * 100);
              console.log('percent', percent);
            }
          };
          xhr.send(data);
        });
    </script>
</body>
</html>
```
