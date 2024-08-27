# 显示滚动条颜色

```html
<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8" />
		<title>test</title>
		<meta
			name="viewport"
			content="width=device-width,initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no"
		/>
	</head>
	<body>
		<style type="text/css">
			.box {
				width: 300px;
				height: 300px;
				border: 1px solid #000;
				overflow: scroll;
				/*
                    -webkit-overflow-scrolling: touch
                    会让iOS下滚动条消失, 所以不能加
                */
			}
			.box .inner {
				width: 1000px;
				height: 600px;
			}
			.box::-webkit-scrollbar {
				height: 9px;
			}
			/* 滑块颜色 */
			.box::-webkit-scrollbar-thumb {
				border-radius: 10px;
				background-color: blue;
			}
			/* 轨道颜色 */
			.box::-webkit-scrollbar-track {
				border-radius: 10px;
				background-color: red;
			}
		</style>
		<div class="box">
			<div class="inner"></div>
		</div>
	</body>
</html>
```

![0](https://github.com/user-attachments/assets/9b79d42f-78d4-482a-929a-a73a9663e3c4)
