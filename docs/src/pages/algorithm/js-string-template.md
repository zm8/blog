# Javascript 字符串模板

如何把下面的代码里面的 `href` 和 `text` 替换了。

```javascript
function render(template, context) {
	return template.replace(/(\{[\w]+\})/g, (match, p1) => {
		console.log(p1); // {href} 和 {content}
		let s = p1.indexOf("{");
		let l = p1.lastIndexOf("}");
		const key = p1.substr(s + 1, l - 1);
		if (context[key]) {
			return context[key];
		}
		return "";
	});
}
var template = '<a href="{href}">{content}</a>';
var context = {
	href: "www.baidu.com",
	content: "百度",
};
const res = render(template, context);
// 输出  <a href="www.baidu.com">百度</a>
console.log(res);
```

首先看下 replace 的用法:

```javascript
function replacer(match, p1, p2, offset, string) {
	console.log(match); // 123oooabc 匹配的整体字符串
	console.log([p1, p2]); // 匹配的 $1, $2, ["123", "abc"]
	console.log(offset); // 偏移量: 2
	console.log(string); // 原始字符串, qq123oooabc111
	console.log("\n");
	// p1 和 p2 调换了下顺序
	return " " + p2 + p1 + " ";
}
var newString = "aaa123oooabc111-aaa321ooocab111".replace(
	/([0-9]+)ooo([a-z]+)/g,
	replacer
);
// 注意字符串里面的 ooo 没了!!!
console.log("newString:", newString);

/*
123oooabc
["123", "abc"]
3
aaa123oooabc111-aaa321ooocab111 

321ooocab
["321", "cab"]
19
aaa123oooabc111-aaa321ooocab111 

newString: aaa abc123 111-aaa cab321 111 
*/
```
