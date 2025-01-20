# CSS 元素居中

## 1. `flex`

```css
.box {
  display: flex;
  justify-content: center;
  align-items: center;
}
```

## 2. `flex` 结合 `margin:auto`

```css
.box {
  display: flex;
}
.box .item {
  margin: auto;
}
```

## 3. 父元素 `relative`，子元素 `absolute` + `transform`

```css
.box {
  position: relative;
}
.box .item {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
```

### 4. 父元素 `relative`，子元素 `absolute` 撑满 + `margin auto`

```css
.box {
  position: relative;
}
.box .item {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  margin: auto;
}
```
