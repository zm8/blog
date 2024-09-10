# moment 常用方法

1. 获取

```js
moment().year() // 年: 2022
moment().month() // 月: 1, 代表2月(因为是从0开始)
moment().date() // 日: 14
moment().hour() // 时: 17
moment().minute() // 分: 58
moment().second() // 秒: 21
moment().day() // 1 星期一, 代表一周的第一天
```

2. 设置, 昨天, 明天; 几时, 几分, 几秒

```js
moment().subtract(1, 'day') // 设置为昨天
moment().add(1, 'day') // 设置为明天
moment().hours(15).minutes(20).seconds(0) // 设置时间 下午3点, 分钟20分钟, 秒为0
```

3. 判断是否 今天 或者 昨天, 注意 isSame 的第 2 个参数是 'day'

```js
// 检查今天
const checkIsToday = (m: Moment) => {
  return m.isSame(moment(), 'day')
}

// 检查昨天
const checkIsYesterday = (m: Moment) => {
  return m.isSame(moment().subtract(1, 'day'), 'day')
}
```

4. 判断在当前时间 在 另外一个时间, 前面还是后面:

```js
moment().isAfter(moment().add(1, 'minute'), 'minute') // false
moment().isBefore(moment().add(1, 'minute'), 'minute') // true
```

PS: 下面的使用方法都是一样, 建议都用单数, 即 year, month, date, hour, minute, sencond;

```js
moment().year === moment().years // false
moment().month === moment().months // false
moment().date === moment().dates // false
moment().hour === moment().hours // true
moment().minute === moment().minutes // true
moment().second === moment().seconds // true
```
