## 1: Hash

- 把当前的 `hash` 和回调函数 注册到一个对象里面。
- 监听 `hashchange`, 当 url 的 hash 发生变化的时候, 通过 `location.hash` 拿到当前 hash, 触发回调函数。
- hash 会和页面的锚点起冲突, 这是个不太好的地方。

```html
<!DOCTYPE html>
<html>
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<meta http-equiv="X-UA-Compatible" content="ie=edge" />
		<title>hash router</title>
	</head>
	<body>
		<ul>
			<li><a href="#/">/</a></li>
			<li><a href="#/page1">page1</a></li>
			<li><a href="#/page2">page2</a></li>
		</ul>
		<div class="content-div"></div>

		<button>back</button>

		<script src="index.js"></script>
	</body>
</html>
```

```javascript
class RouterClass {
	constructor() {
		this.routes = {}; // 记录路径标识符对应的cb
		this.currentUrl = ""; // 记录hash只为方便执行cb
		this.isBack = false;
		window.addEventListener("load", () => this.render());
		window.addEventListener("hashchange", () => this.render());

		this.historyStack = [];
	}

	/**
	 * 初始化
	 */
	static init() {
		window.Router = new RouterClass();
	}

	/**
	 * 注册路由和回调
	 * @param path
	 * @param cb 回调
	 */
	route(path, cb) {
		this.routes[path] = cb || function () {};
	}

	/**
	 * 记录当前hash，执行cb
	 */
	render() {
		let hash = this.getHash();

		if (this.isBack) {
			// 若当前是用户点了back, 则不存储 hash
			this.isBack = false;
		} else {
			this.historyStack.push(hash);
		}

		this.routes[hash]();
	}
	getHash() {
		return location.hash.slice(1) || "/";
	}
	back() {
		this.isBack = true;
		this.historyStack.pop();
		if (this.historyStack.length === 0) {
			return;
		}
		let hash = this.historyStack[this.historyStack.length - 1];
		location.hash = hash;
	}
}

RouterClass.init();
const ContentDom = document.querySelector(".content-div");
const changeContent = (content) => (ContentDom.innerHTML = content);

Router.route("/", () => changeContent("默认页面"));
Router.route("/page1", () => changeContent("page1页面"));
Router.route("/page2", () => changeContent("page2页面"));

const BtnDom = document.querySelector("button");
BtnDom.addEventListener("click", Router.back.bind(Router), false);
```

## 2. HTML5 History Api

- `pushState` 方法, `history.pushState({ path }, null, path)`, 会让 url 上多个`path`, 并且第一个参数会在监听 `popstate` 的时候, 通过 `e.state.path` 拿到数据。
- 和 `hash` 的比较是, 每个 `path` 的点击必须绑定事件, 并且主动调用 `history.pushStat`e 方法。
- 当用户点击 前进后退的时候, `hash` 触发的是 `hashchange`, `History Api` 触发的是 `popstate`
- `History` 不需要考虑绑定的 `back` 事件。

```html
<!DOCTYPE html>
<html>
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<meta http-equiv="X-UA-Compatible" content="ie=edge" />
		<title>h5 router</title>
	</head>
	<body>
		<ul>
			<li><a href="/">/</a></li>
			<li><a href="/page1">page1</a></li>
			<li><a href="/page2">page2</a></li>
		</ul>
		<div class="content-div"></div>
		<script src="./index.js"></script>
	</body>
</html>
```

```javascript
class RouterClass {
	constructor(path) {
		this.routes = {}; // 记录路径标识符对应的cb
		history.replaceState({ path }, null, path);
		this.routes[path] && this.routes[path]();
		window.addEventListener("popstate", (e) => {
			console.log(e, " --- e");
			const path = e.state && e.state.path;
			this.routes[path] && this.routes[path]();
		});
	}

	/**
	 * 初始化
	 */
	static init() {
		window.Router = new RouterClass(location.pathname);
	}

	/**
	 * 记录path对应cb
	 * @param path 路径
	 * @param cb 回调
	 */
	route(path, cb) {
		this.routes[path] = cb || function () {};
	}

	/**
	 * 触发路由对应回调
	 * @param path
	 */
	go(path) {
		history.pushState({ path }, null, path);
		this.routes[path] && this.routes[path]();
	}
}

RouterClass.init();
const ul = document.querySelector("ul");
const ContentDom = document.querySelector(".content-div");
const changeContent = (content) => (ContentDom.innerHTML = content);

Router.route("/", () => changeContent("默认页面"));
Router.route("/page1", () => changeContent("page1页面"));
Router.route("/page2", () => changeContent("page2页面"));

ul.addEventListener("click", (e) => {
	if (e.target.tagName === "A") {
		e.preventDefault();
		Router.go(e.target.getAttribute("href"));
	}
});
```
