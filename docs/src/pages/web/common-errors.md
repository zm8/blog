# 常见异常问题解决

## Ant design 上传大文件(也就 100 多 k)，服务器报 500 错误

本地开发环境大文件没问题 ok, 但是代码上到开发和测试环境 大文件报 500 错误。

虽然已经设置允许跨域了，但是控制台提示是跨域问题(如下图)。

真正原因是文件目录的访问权限的问题，得让运维同学配置`nginx`的 `client_body_temp_path(/var/lib/nginx)` 的目录有写的权限。

![image](https://user-images.githubusercontent.com/32337542/71657541-4b8d4c00-2d7b-11ea-82be-f9ad875606b7.png)

![image](https://user-images.githubusercontent.com/32337542/71657575-79729080-2d7b-11ea-8aea-26ca72ae3547.png)

![image](https://user-images.githubusercontent.com/32337542/71657613-9dce6d00-2d7b-11ea-9d8e-d61832a5ad8e.png)
