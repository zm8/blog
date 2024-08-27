# Rxjs Marble Diagrams

我們用 - 來表達一小段時間，這些 - 串起就代表一個 observable。

```
----------------
```

**X** (大寫 X)則代表有錯誤發生

```
---------------X
```

**|** 則代表 observable 結束

```
----------------|
```

## 1.of

observable 是同步送值的時候, 小括號代表著同步發生。

```javascript
var source = Rx.Observable.of(1, 2, 3, 4);
```

```
(1234)|
```

## 2. interval

```javascript
var source = Rx.Observable.interval(1000);
```

```
-----0-----1-----2-----3--...
```

## 3. map

```javascript
var source = Rx.Observable.interval(1000);
var newest = source.map((x) => x + 2);
newest.subscribe(console.log);
// 2
// 3
// 4
// 5..
```

```
source: -----0-----1-----2-----3--...
            map(x => x + 1)
newest: -----1-----2-----3-----4--...
```

## 4. mapTo

```javascript
var source = Rx.Observable.interval(1000);
var newest = source.mapTo(2);
newest.subscribe(console.log);
// 2
// 2
// 2
// 2..
```

```
source: -----0-----1-----2-----3--...
                mapTo(2)
newest: -----2-----2-----2-----2--...
```

## 5. filter

```javascript
var source = Rx.Observable.interval(1000);
var newest = source.filter((x) => x % 2 === 0);
newest.subscribe(console.log);
// 0
// 2
// 4
// 6..
```

```
source: -----0-----1-----2-----3-----4-...
            filter(x => x % 2 === 0)
newest: -----0-----------2-----------4-...
```

## 6. take

```javascript
var source = Rx.Observable.interval(1000);
var example = source.take(3);
example.subscribe({
	next: (value) => {
		console.log(value);
	},
	error: (err) => {
		console.log("Error: " + err);
	},
	complete: () => {
		console.log("complete");
	},
});
// 0
// 1
// 2
// complete
```

```
source : -----0-----1-----2-----3--..
                take(3)
example: -----0-----1-----2|
```

## 7. first

和 take(1)一致

```javascript
var source = Rx.Observable.interval(1000);
var example = source.first();
example.subscribe({
	next: (value) => {
		console.log(value);
	},
	error: (err) => {
		console.log("Error: " + err);
	},
	complete: () => {
		console.log("complete");
	},
});
// 0
// complete
```

```
source : -----0-----1-----2-----3--..
                first()
example: -----0|
```

## 8. takeLast

takeLast 必須等到整個 observable 完成(complete)，才能知道最後的元素有哪些，並且同步送出

```javascript
var source = Rx.Observable.interval(1000).take(6);
var example = source.takeLast(2);
example.subscribe({
	next: (value) => {
		console.log(value);
	},
	error: (err) => {
		console.log("Error: " + err);
	},
	complete: () => {
		console.log("complete");
	},
});
// 4
// 5
// complete
```

```
source : ----0----1----2----3----4----5|
                takeLast(2)
example: ------------------------------(45)|
```

## 9. last

相当于 takeLast(1)，用來取得最後一個元素。

```javascript
var source = Rx.Observable.interval(1000).take(6);
var example = source.last();
example.subscribe({
	next: (value) => {
		console.log(value);
	},
	error: (err) => {
		console.log("Error: " + err);
	},
	complete: () => {
		console.log("complete");
	},
});
// 5
// complete
```

```
source : ----0----1----2----3----4----5|
                    last()
example: ------------------------------(5)|
```

## 10. takeUntil

當 takeUntil 傳入的 observable 發送值時，原本的 observable 就會直接進入完成(complete)的狀態，並且發送完成訊息。

```javascript
var source = Rx.Observable.interval(1000);
var click = Rx.Observable.fromEvent(document.body, "click");
var example = source.takeUntil(click);

example.subscribe({
	next: (value) => {
		console.log(value);
	},
	error: (err) => {
		console.log("Error: " + err);
	},
	complete: () => {
		console.log("complete");
	},
});
// 0
// 1
// 2
// 3
// complete (點擊body了)
```

```
source : -----0-----1-----2------3--
click  : ----------------------c----
                takeUntil(click)
example: -----0-----1-----2----|
```

## 11. concat

concat 可以把多個 observable 實例合併成一個

```javascript
var source = Rx.Observable.interval(1000).take(3);
var source2 = Rx.Observable.of(3);
var source3 = Rx.Observable.of(4, 5, 6);
var example = source.concat(source2, source3);
example.subscribe({
	next: (value) => {
		console.log(value);
	},
	error: (err) => {
		console.log("Error: " + err);
	},
	complete: () => {
		console.log("complete");
	},
});
// 0
// 1
// 2
// 3
// 4
// 5
// 6
// complete
```

```
source : ----0----1----2|
source2: (3)|
source3: (456)|
            concat()
example: ----0----1----2(3456)|
```

另外 concat 還可以當作靜態方法使用

```javascript
var source = Rx.Observable.interval(1000).take(3);
var source2 = Rx.Observable.of(3);
var source3 = Rx.Observable.of(4, 5, 6);
var example = Rx.Observable.concat(source, source2, source3);
example.subscribe({
	next: (value) => {
		console.log(value);
	},
	error: (err) => {
		console.log("Error: " + err);
	},
	complete: () => {
		console.log("complete");
	},
});
```

## 12. concatAll

Observable 送出的元素又是一個 observable，就像是二維陣列，陣列裡面的元素是陣列，可以用 concatAll 把它攤平成一維陣列. 把二维阵列变成维.

```javascript
var click = Rx.Observable.fromEvent(document.body, "click");
var source = click.map((e) => Rx.Observable.of(1, 2, 3));
var example = source.concatAll();
example.subscribe({
	next: (value) => {
		console.log(value);
	},
	error: (err) => {
		console.log("Error: " + err);
	},
	complete: () => {
		console.log("complete");
	},
});
```

```
click  : ------c------------c--------
        map(e => Rx.Observable.of(1,2,3))
source : ------o------------o--------
                \            \
                 (123)|       (123)|
                   concatAll()
example: ------(123)--------(123)------------
```

這裡需要注意的是 concatAll 會處理 source 先發出來的 observable，必須等到這個 observable 結束，才會再處理下一個 source 發出來的 observable。

```javascript
var obs1 = Rx.Observable.interval(1000).take(5);
var obs2 = Rx.Observable.interval(500).take(2);
var obs3 = Rx.Observable.interval(2000).take(1);
var source = Rx.Observable.of(obs1, obs2, obs3);
var example = source.concatAll();
example.subscribe({
	next: (value) => {
		console.log(value);
	},
	error: (err) => {
		console.log("Error: " + err);
	},
	complete: () => {
		console.log("complete");
	},
});
// 0
// 1
// 2
// 3
// 4
// 0
// 1
// 0
// complete
```

```
source : (o1                 o2      o3)|
           \                  \       \
            --0--1--2--3--4|   -0-1|   ----0|

                concatAll()
example: --0--1--2--3--4-0-1----0|
```

## 13. skip

原本從 0 開始的就會變成從 3 開始，**但是記得原本元素的等待時間仍然存在**，也就是說此範例第一個取得的元素需要等 4 秒，用 Marble Diagram 表示如下。

```javascript
var source = Rx.Observable.interval(1000);
var example = source.skip(3);
example.subscribe({
	next: (value) => {
		console.log(value);
	},
	error: (err) => {
		console.log("Error: " + err);
	},
	complete: () => {
		console.log("complete");
	},
});
// 3
// 4
// 5...
```

```
source : ----0----1----2----3----4----5--....
                    skip(3)
example: -------------------3----4----5--...
```

## 14. startWith

startWith 的值是一開始就同步發出的，這個 operator 很常被用來保存程式的起始狀態！
下面的例子，不会过 1 秒才出现 0，而是马上出现 0

```javascript
var source = Rx.Observable.interval(1000);
var example = source.startWith(0);
example.subscribe({
	next: (value) => {
		console.log(value);
	},
	error: (err) => {
		console.log("Error: " + err);
	},
	complete: () => {
		console.log("complete");
	},
});
// 0 马上发出
// 0 过1秒
// 1
// 2
// 3...
```

```
source : ----0----1----2----3--...
                startWith(0)
example: (0)----0----1----2----3--...
```

## 15. merge

merge 把多個 observable 同時處理，這跟 concat 一次處理一個 observable 是完全不一樣的.

```javascript
var source = Rx.Observable.interval(500).take(3);
var source2 = Rx.Observable.interval(300).take(6);
var example = source.merge(source2);
example.subscribe({
	next: (value) => {
		console.log(value);
	},
	error: (err) => {
		console.log("Error: " + err);
	},
	complete: () => {
		console.log("complete");
	},
});
// 0
// 0
// 1
// 2
// 1
// 3
// 2
// 4
// 5
// complete
```

```
source : ----0----1----2|
source2: --0--1--2--3--4--5|
            merge()
example: --0-01--21-3--(24)--5|
```

**這很常用在一個以上的按鈕具有部分相同的行為。**
例如一個影片播放器有兩個按鈕，一個是暫停(II)，另一個是結束播放(口)。這兩個按鈕都具有相同的行為就是影片會被停止，只是結束播放會讓影片回到 00 秒，這時我們就可以把這兩個按鈕的事件 merge 起來處理影片暫停這件事。

```javascript
var stopVideo = Rx.Observable.merge(stopButton, endButton);
stopVideo.subscribe(() => {
	// 暫停播放影片
});
```

非同步最難的地方在於，當有多個非同步行為同時觸發且相互依賴，這時候我們要處理的邏輯跟狀態就會變得極其複雜.
它們都是在多個元素送進來時，只輸出一個新元素.

## 16. combineLatest

它會取得各個 observable 最後送出的值，再輸出成一個值

**描述:**

- newest 和 source 其中一个送出值的时候
- 和另外一个最新送出的值
- 传入 callback
- 当 newest 和 source 都结束了, 才会 complete

**例子流程:**

- newest 送出了 `0`，source 没有送出，不會執行 callback
- source 送出了 `0`，newest 送出`0`，callback 等于 `0`
- newest 送出了 `1`，source 送出 `0`，callback 等于 `1`
  ........................
- newest 和 source 都結束了，complete

```javascript
var source = Rx.Observable.interval(500).take(3);
var newest = Rx.Observable.interval(300).take(6);
var example = source.combineLatest(newest, (x, y) => x + y);
example.subscribe({
	next: (value) => {
		console.log(value);
	},
	error: (err) => {
		console.log("Error: " + err);
	},
	complete: () => {
		console.log("complete");
	},
});
// 0
// 1
// 2
// 3
// 4
// 5
// 6
// 7
// complete
```

```
source : ----0----1----2|
newest : --0--1--2--3--4--5|
    combineLatest(newest, (x, y) => x + y);
example: ----01--23-4--(56)--7|
```

**应用:**
combineLatest 很常用在運算多個因子的結果;
A 和 B 的值求出 C, A 变化, 则 C 变化; B 变化, 则 C 也变化

## 17. zip

**描述:**

1.  newest 和 source 其中一个送出值的时候
2.  若当前另 1 个同位置有值
3.  传入 callback
4.  任意 1 个结束, 就会 complete

**例子流程:**

- newest 送出了 0，source 没有送出，不會執行 callback
- source 送出了 0，newest 送出 0，callback 等于 0
- ….. 一直不执行 callback
- source 送出了 1，newest 虽然现在最新的是 2，但是之前送出的是 1，callback 等于 2(1+1)
- ….. 一直不执行 callback
- source 送出了 2，newest 之前送出的是 2， callback 等于 4
- source 結束 example 就結束，因為 source 跟 newest 不會再有對應位置的值

```javascript
var source = Rx.Observable.interval(500).take(3);
var newest = Rx.Observable.interval(300).take(6);
var example = source.zip(newest, (x, y) => x + y);
example.subscribe({
	next: (value) => {
		console.log(value);
	},
	error: (err) => {
		console.log("Error: " + err);
	},
	complete: () => {
		console.log("complete");
	},
});
// 0
// 2
// 4
// complete
```

```
source : ----0----1----2|
newest : --0--1--2--3--4--5|
    zip(newest, (x, y) => x + y)
example: ----0----2----4|
```

**应用:**
zip 适用原本只能同步送出的資料變成了非同步的, 常拿來做 demo 使用，比如：

```javascript
var source = Rx.Observable.from("hello");
var source2 = Rx.Observable.interval(100);
var example = source.zip(source2, (x, y) => x);
```

```
source : (hello)|
source2: -0-1-2-3-4-...
        zip(source2, (x, y) => x)
example: -h-e-l-l-o|
```

## 18. withLatestFrom

withLatestFrom 運作方式跟 combineLatest 有點像，只是他有主從的關係，只有在主要的 observable 送出新的值時，才會執行 callback，附隨的 observable 只是在背景下運作

**描述:**

1. main 送出值的时候
2. 和另外一个最新送出的值
3. 传入 callback
4. main 结束时, 就会 complete

**例子流程:**

- main 送出了 h，some 上一次送出的值為 0，callback 得到 h。
- main 送出了 e，some 上一次送出的值為 0，callback 得到 e。
- main 送出了 l，some 上一次送出的值為 0，callback 得到 l。
- main 送出了 l，some 上一次送出的值為 1，callback 得到 L。
- main 送出了 o，some 上一次送出的值為 1，callback 得到 O。

```javascript
var main = Rx.Observable.from("hello").zip(
	Rx.Observable.interval(500),
	(x, y) => x
);
var some = Rx.Observable.from([0, 1, 0, 0, 0, 1]).zip(
	Rx.Observable.interval(300),
	(x, y) => x
);
var example = main.withLatestFrom(some, (x, y) => {
	return y === 1 ? x.toUpperCase() : x;
});
example.subscribe({
	next: (value) => {
		console.log(value);
	},
	error: (err) => {
		console.log("Error: " + err);
	},
	complete: () => {
		console.log("complete");
	},
});
```

```
main   : ----h----e----l----l----o|
some   : --0--1--0--0--0--1|
withLatestFrom(some, (x, y) =>  y === 1 ? x.toUpperCase() : x);
example: ----h----e----l----L----O|
```

**应用:**
withLatestFrom 很常用在一些 checkbox 型的功能，例如說一個編輯器，我們開啟粗體後，打出來的字就都要變粗體，粗體就像是 some observable，而我們打字就是 main observable。

## 19. scan

```javascript
var source = Rx.Observable.from("hello").zip(
	Rx.Observable.interval(600),
	(x, y) => x
);
var example = source.scan((origin, next) => origin + next, "");
example.subscribe({
	next: (value) => {
		console.log(value);
	},
	error: (err) => {
		console.log("Error: " + err);
	},
	complete: () => {
		console.log("complete");
	},
});
// h
// he
// hel
// hell
// hello
// complete
```

```
source : ----h----e----l----l----o|
    scan((origin, next) => origin + next, '')
example: ----h----(he)----(hel)----(hell)----(hello)|
```

scan 很常用在狀態的計算處理，最簡單的就是對一個數字的加減，我們可以綁定一個 button 的 click 事件，並用 map 把 click event 轉成 1，之後送處 scan 計算值再做顯示。

```javascript
const addButton = document.getElementById("addButton");
const minusButton = document.getElementById("minusButton");
const state = document.getElementById("state");
const addClick = Rx.Observable.fromEvent(addButton, "click").mapTo(1);
const minusClick = Rx.Observable.fromEvent(minusButton, "click").mapTo(-1);
const numberState = Rx.Observable.empty()
	.startWith(0)
	.merge(addClick, minusClick)
	.scan((origin, next) => origin + next, 0);

numberState.subscribe({
	next: (value) => {
		state.innerHTML = value;
	},
	error: (err) => {
		console.log("Error: " + err);
	},
	complete: () => {
		console.log("complete");
	},
});
```

## 20. buffer

5 个相关的 operator

- buffer
- bufferCount
- bufferTime
- bufferToggle
- bufferWhen

buffer 要傳入一個 observable(source2)，它會把原本的 observable (source)送出的元素緩存在陣列中，等到傳入的 observable(source2) 送出元素時，就會觸發把緩存的元素送出。

```javascript
var source = Rx.Observable.interval(300);
/*
    相当于
    var source2 = source.bufferTime(1000);
 */
var source2 = Rx.Observable.interval(1000);
var example = source.buffer(source2);
example.subscribe({
	next: (value) => {
		console.log(value);
	},
	error: (err) => {
		console.log("Error: " + err);
	},
	complete: () => {
		console.log("complete");
	},
});
// [0,1,2]
// [3,4,5]
// [6,7,8]...
```

```
source : --0--1--2--3--4--5--6--7..
source2: ---------0---------1--------...
            buffer(source2)
example: ---------([0,1,2])---------([3,4,5])
```

除了用時間來作緩存外，我們更常用數量來做緩存，範例如下:

```javascript
var source = Rx.Observable.interval(300);
var example = source.bufferCount(3);
example.subscribe({
	next: (value) => {
		console.log(value);
	},
	error: (err) => {
		console.log("Error: " + err);
	},
	complete: () => {
		console.log("complete");
	},
});
// [0,1,2]
// [3,4,5]
// [6,7,8]...
```

可以用 buffer 來做某個事件的過濾，例如像是滑鼠連點才能真的執行，
這裡我們只有在 500 毫秒內連點兩下，才能成功印出 ‘success’，
這個功能在某些特殊的需求中非常的好用，也能用在批次處理來降低 request 傳送的次數！
代码如下:

```javascript
const button = document.getElementById("demo");
const click = Rx.Observable.fromEvent(button, "click");
const example = click.bufferTime(500).filter((arr) => arr.length >= 2);
example.subscribe({
	next: (value) => {
		console.log("success");
	},
	error: (err) => {
		console.log("Error: " + err);
	},
	complete: () => {
		console.log("complete");
	},
});
```

## 21. delay

```javascript
var source = Rx.Observable.interval(300).take(5);
var example = source.delay(500);
example.subscribe({
	next: (value) => {
		console.log(value);
	},
	error: (err) => {
		console.log("Error: " + err);
	},
	complete: () => {
		console.log("complete");
	},
});
// 0
// 1
// 2
// 3
// 4
```

```
source : --0--1--2--3--4|
        delay(500)
example: -------0--1--2--3--4|
```

delay 除了可以傳入毫秒以外，也可以傳入 Date 型別的資料

```javascript
var source = Rx.Observable.interval(300).take(5);
var example = source.delay(new Date(new Date().getTime() + 1000));
example.subscribe({
	next: (value) => {
		console.log(value);
	},
	error: (err) => {
		console.log("Error: " + err);
	},
	complete: () => {
		console.log("complete");
	},
});
```

## 22. delayWhen

delayWhen 可以影響每個元素，而且需要傳一個 callback 並回傳一個 observable

```javascript
var source = Rx.Observable.interval(300).take(5);
var example = source.delayWhen((x) => Rx.Observable.empty().delay(100 * x * x));
example.subscribe({
	next: (value) => {
		console.log(value);
	},
	error: (err) => {
		console.log("Error: " + err);
	},
	complete: () => {
		console.log("complete");
	},
});
```

```
source : --0--1--2--3--4|
    .delayWhen(x => Rx.Observable.empty().delay(100 * x * x));
example: --0---1----2-----3-----4|
```

## 23. debounce

debounce 跟 debounceTime 一個是傳入 observable 另一個則是傳入毫秒，比較常用到的是 debounceTime
**描述:**

1. 每次收到元素，等待 1000 毫秒
2. 若 1000 毫秒内没有元素送出, 则把最新收到的元素送出; 若 1000 毫秒内收到新的元素, 重新等待 1000 毫秒.
3. 注意若是**最后一个元素**, 则不需要等待 1000 毫秒, 直接送出

```javascript
var source = Rx.Observable.interval(300).take(5);
var example = source.debounceTime(1000);
example.subscribe({
	next: (value) => {
		console.log(value);
	},
	error: (err) => {
		console.log("Error: " + err);
	},
	complete: () => {
		console.log("complete");
	},
});
// 4
// complete
```

```
source : --0--1--2--3--4|
        debounceTime(1000)
example: --------------4|
```

具体例子, 自動傳送使用者打的字到後端:

```javascript
const searchInput = document.getElementById("searchInput");
const theRequestValue = document.getElementById("theRequestValue");
Rx.Observable.fromEvent(searchInput, "input")
	.debounceTime(300)
	.map((e) => e.target.value)
	.subscribe((value) => {
		theRequestValue.textContent = value;
		// 在這裡發 request
	});
```

## 24. throttle

**描述:**

1. 第 1 次收到元素先送出,
2. 1000 毫秒以内处于关闭状态, 1000 毫秒后, 若收到元素, 则送出
3. 最后 1 个元素不一定会送出

```javascript
var source = Rx.Observable.interval(400).take(8);
var example = source.throttleTime(1000);
example.subscribe({
	next: (value) => {
		console.log(value);
	},
	error: (err) => {
		console.log("Error: " + err);
	},
	complete: () => {
		console.log("complete");
	},
});
// 0
// 3
// 6
// complete
```

```
source : ---0---1---2---3---4---5---6---7|
        throttleTime(1000)
example: ---0-----------3-----------6----|
```

下面要说 3 个处理 Higher Order Observable. 所謂的 Higher Order Observable 就是指一個 Observable 送出的元素還是一個 Observable，就像是二維陣列一樣，一個陣列中的每個元素都是陣列。
一共有 3 个方法:

- concatAll
- mergeAll
- switch

## 25. concatAll

concatAll 會一個一個處理，一定是等前一個 observable 完成(complete)才會處理下一個 observable

```javascript
var click = Rx.Observable.fromEvent(document.body, "click");
var source = click.map((e) => Rx.Observable.interval(1000).take(3));
var example = source.concatAll();
example.subscribe({
	next: (value) => {
		console.log(value);
	},
	error: (err) => {
		console.log("Error: " + err);
	},
	complete: () => {
		console.log("complete");
	},
});
```

```
click  : ---------c-c------------------c--..
        map(e => Rx.Observable.interval(1000))
source : ---------o-o------------------o--..
                   \ \                  \
                    \ ----0----1----2|   ----0----1----2|
                     ----0----1----2|
                     concatAll()
example: ----------------0----1----2----0----1----2--..
```

## 26. switch

当有新的 observable 来的时候, 就会把旧的退訂, 永远只处理新的 observable.
下面的例子, 当第 2 次点击的时候，**由于第 2 个 observable 和第 1 个时间小于 1 秒**，所以第 1 个就被退订了

```javascript
var click = Rx.Observable.fromEvent(document.body, "click");
var source = click.map((e) => Rx.Observable.interval(1000));
var example = source.switch();
example.subscribe({
	next: (value) => {
		console.log(value);
	},
	error: (err) => {
		console.log("Error: " + err);
	},
	complete: () => {
		console.log("complete");
	},
});
```

```
click  : ---------c-c------------------c--..
        map(e => Rx.Observable.interval(1000))
source : ---------o-o------------------o--..
                   \ \                  \----0----1--...
                    \ ----0----1----2----3----4--...
                     ----0----1----2----3----4--...
                     switch()
example: -----------------0----1----2--------0----1--...
```

## 27. mergeAll

它會把二維的 observable 轉成一維的，並且能夠同時處理所有的 observable。
**若传入的参数是 1, 则和 concatAll 是一摸一样的**

```javascript
var click = Rx.Observable.fromEvent(document.body, "click");
var source = click.map((e) => Rx.Observable.interval(1000));
var example = source.mergeAll();
example.subscribe({
	next: (value) => {
		console.log(value);
	},
	error: (err) => {
		console.log("Error: " + err);
	},
	complete: () => {
		console.log("complete");
	},
});
```

```
click  : ---------c-c------------------c--..
        map(e => Rx.Observable.interval(1000))
source : ---------o-o------------------o--..
                   \ \                  \----0----1--...
                    \ ----0----1----2----3----4--...
                     ----0----1----2----3----4--...
                     switch()
example: ----------------00---11---22---33---(04)4--...
```

另外 mergeAll 可以傳入一個數值，這個數值代表他可以同時處理的 observable 數量

```javascript
var click = Rx.Observable.fromEvent(document.body, "click");
var source = click.map((e) => Rx.Observable.interval(1000).take(3));
var example = source.mergeAll(2);
example.subscribe({
	next: (value) => {
		console.log(value);
	},
	error: (err) => {
		console.log("Error: " + err);
	},
	complete: () => {
		console.log("complete");
	},
});
```

```
click  : ---------c-c----------o----------..
        map(e => Rx.Observable.interval(1000))
source : ---------o-o----------c----------..
                   \ \          \----0----1----2|
                    \ ----0----1----2|
                     ----0----1----2|
                     mergeAll(2)
example: ----------------00---11---22---0----1----2--..
```

## 28. concatMap

concatMap= map+concatAll

```javascript
var source = Rx.Observable.fromEvent(document.body, "click");
var example = source
	.map((e) => Rx.Observable.interval(1000).take(3))
	.concatAll();
example.subscribe({
	next: (value) => {
		console.log(value);
	},
	error: (err) => {
		console.log("Error: " + err);
	},
	complete: () => {
		console.log("complete");
	},
});
```

相当于

```javascript
var source = Rx.Observable.fromEvent(document.body, "click");
var example = source.concatMap((e) => Rx.Observable.interval(100).take(3));
example.subscribe({
	next: (value) => {
		console.log(value);
	},
	error: (err) => {
		console.log("Error: " + err);
	},
	complete: () => {
		console.log("complete");
	},
});
```

Marble Diagram:

```
source : -----------c--c------------------...
        concatMap(c => Rx.Observable.interval(100).take(3))
example: -------------0-1-2-0-1-2---------...
```

常用于發送 request 如下, **每一個 request 會等前一個 request 完成才做處理**。

```javascript
function getPostData() {
	return fetch("https://jsonplaceholder.typicode.com/posts/1").then((res) =>
		res.json()
	);
}
var source = Rx.Observable.fromEvent(document.body, "click");
var example = source.concatMap((e) => Rx.Observable.from(getPostData()));
example.subscribe({
	next: (value) => {
		console.log(value);
	},
	error: (err) => {
		console.log("Error: " + err);
	},
	complete: () => {
		console.log("complete");
	},
});
```

concatMap 還有第二個參數是一個 selector callback，這個 callback 會傳入四個參數，分別是:

1. 外部 observable 送出的元素
2. 內部 observable 送出的元素
3. 外部 observable 送出元素的 index
4. 內部 observable 送出元素的 index

```javascript
function getPostData() {
	return fetch("https://jsonplaceholder.typicode.com/posts/1").then((res) =>
		res.json()
	);
}
var source = Rx.Observable.fromEvent(document.body, "click");
var example = source.concatMap(
	(e) => Rx.Observable.from(getPostData()),
	(e, res, eIndex, resIndex) => res.title
);
example.subscribe({
	next: (value) => {
		console.log(value);
	},
	error: (err) => {
		console.log("Error: " + err);
	},
	complete: () => {
		console.log("complete");
	},
});
```

## 29. switchMap

switchMap = map+switch
switchMap 跟 concatMap 一樣有第二個參數 selector callback 可用來回傳我們要的值

```javascript
var source = Rx.Observable.fromEvent(document.body, "click");
var example = source.map((e) => Rx.Observable.interval(1000).take(3)).switch();

example.subscribe({
	next: (value) => {
		console.log(value);
	},
	error: (err) => {
		console.log("Error: " + err);
	},
	complete: () => {
		console.log("complete");
	},
});
```

相当于:

```javascript
var source = Rx.Observable.fromEvent(document.body, "click");
var example = source.switchMap((e) => Rx.Observable.interval(100).take(3));

example.subscribe({
	next: (value) => {
		console.log(value);
	},
	error: (err) => {
		console.log("Error: " + err);
	},
	complete: () => {
		console.log("complete");
	},
});
```

Marble Diagram:

```
source : -----------c--c-----------------...
        concatMap(c => Rx.Observable.interval(100).take(3))
example: -------------0--0-1-2-----------...
```

switchMap 用在 HTTP request, 雖然我們發送了多個 request 但最後真正印出來的 log 只會有一個

```javascript
function getPostData() {
	return fetch("https://jsonplaceholder.typicode.com/posts/1").then((res) =>
		res.json()
	);
}
var source = Rx.Observable.fromEvent(document.body, "click");
var example = source.switchMap((e) => Rx.Observable.from(getPostData()));
example.subscribe({
	next: (value) => {
		console.log(value);
	},
	error: (err) => {
		console.log("Error: " + err);
	},
	complete: () => {
		console.log("complete");
	},
});
```

## 30. mergeMap

mergeMap = map + mergeAll

```javascript
var source = Rx.Observable.fromEvent(document.body, "click");
var example = source
	.map((e) => Rx.Observable.interval(1000).take(3))
	.mergeAll();

example.subscribe({
	next: (value) => {
		console.log(value);
	},
	error: (err) => {
		console.log("Error: " + err);
	},
	complete: () => {
		console.log("complete");
	},
});
```

相当于

```javascript
var source = Rx.Observable.fromEvent(document.body, "click");
var example = source.mergeMap((e) => Rx.Observable.interval(100).take(3));

example.subscribe({
	next: (value) => {
		console.log(value);
	},
	error: (err) => {
		console.log("Error: " + err);
	},
	complete: () => {
		console.log("complete");
	},
});
```

Marble Diagram:

```
source : -----------c-c------------------...
        concatMap(c => Rx.Observable.interval(100).take(3))
example: -------------0-(10)-(21)-2----------...
```

mergeMap 也能傳入第 2 個參數和 concatMap 是一样的，但 mergeMap 传入第 3 个参数限制并行数量
(**限制但是不是阻止的意思**)
下面的例子，若连续点击 4 下，第 4 个 HTTP request 需要等第 1 个结束以后才可以发送

```javascript
function getPostData() {
	return fetch("https://jsonplaceholder.typicode.com/posts/1").then((res) =>
		res.json()
	);
}
var source = Rx.Observable.fromEvent(document.body, "click");
var example = source.mergeMap(
	(e) => Rx.Observable.from(getPostData()),
	(e, res, eIndex, resIndex) => res.title,
	3
);
example.subscribe({
	next: (value) => {
		console.log(value);
	},
	error: (err) => {
		console.log("Error: " + err);
	},
	complete: () => {
		console.log("complete");
	},
});
```

switchMap, mergeMap, concatMap 相同和不同的地方
共同的特性: 可以把第一個參數所回傳的 promise 物件直接轉成 observable

```javascript
function getPersonData() {
	return fetch("https://jsonplaceholder.typicode.com/posts/1").then((res) =>
		res.json()
	);
}
var source = Rx.Observable.fromEvent(document.body, "click");
// 不需要写成
// var example = source.concatMap(e => Rx.Observable.from(getPersonData()));
var example = source.concatMap((e) => getPersonData());
//直接回傳 promise 物件
example.subscribe({
	next: (value) => {
		console.log(value);
	},
	error: (err) => {
		console.log("Error: " + err);
	},
	complete: () => {
		console.log("complete");
	},
});
```

::: tip 参考链接

https://ithelp.ithome.com.tw/articles/10189028

:::
