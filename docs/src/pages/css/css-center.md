## 1. 理解

1. 为了实现下面图片的方式:
   ![image](https://user-images.githubusercontent.com/32337542/73833773-7a4c8580-4845-11ea-8689-281e028fe40d.png)
2. 通用的 html 和 css

```html
<div class="box">
	<div class="child"></div>
</div>
```

```css
.box {
	width: 200px;
	height: 200px;
	border: 1px solid blue;
	position: relative;
}

.box .child {
	background-color: red;
	width: 100px;
	height: 100px;
}
```

## 2. 对 div 元素

1. `left:0, right:0, top:0, bottom: 0;`

```css
.box .child {
	position: absolute;
	top: 0;
	bottom: 0;
	left: 0;
	right: 0;
	margin: auto;
}
```

2. `translate`

```css
.box .child {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
}
```

3. flex 布局

只设置父元素

```css
.box {
	display: flex;
	align-items: center;
	justify-content: center;
}
```

1. flex 布局-2

父元素和子元素都设置

```css
.box {
	display: flex;
}
.box .child {
	margin: auto;
}
```

## 3.对于图片

#### 1. 使用 line-height 和 vertical-align

![image](https://user-images.githubusercontent.com/32337542/73835189-f778fa00-4847-11ea-89e5-28354eb25b92.png)

html

```html
<div class="box">
	<img
		class="child"
		src="https://www.baidu.com/img/pc_1c6e30772d5e4103103bd460913332f9.png"
	/>
</div>
```

css

```css
.box {
	width: 200px;
	height: 200px;
	border: 1px solid blue;

	text-align: center; /* 水平居中 */
	line-height: 200px; /* 垂直居中 */
}

.box .child {
	background-color: red;
	width: 100px;
	height: 100px;

	vertical-align: middle; /* 垂直居中 */
}
```

#### 2. 使用 display: table (对文字也有效)

![image](https://user-images.githubusercontent.com/32337542/73836488-58a1cd00-484a-11ea-9600-0312666bf5a6.png)

html

```html
<div class="box">
	<div class="child">
		<img src="https://www.baidu.com/img/baidu_resultlogo@2.png" />
	</div>
</div>
```

css

```css
.box {
	width: 300px;
	height: 300px;
	border: 1px solid blue;

	display: table; /* 垂直居中 */
}

.box .child {
	display: table-cell; /* 垂直居中 */
	vertical-align: middle; /* 垂直居中 */
	text-align: center; /* 水平居中 */
}
img {
	border: 1px solid red;
}
```
