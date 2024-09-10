### 组件什么时候会卸载?

React 的 useState 返回的值, 哪种情况会重置了? 会在这个组件卸载的时候重置, 那么哪些情况组件会卸载:

1. 路由发生变化的时候;

2. 组件的 key 发生变化的时候, 下面的组件, 当 'key1' 变成 'key2' 的时候;

```jsx
<Component key="key1" />
```

3. 组件根据状态不再加载的时候:

```jsx
const [visible, setVisible] = useState(false)
return <div>{visible && <Com />}</div>
```

4. 下面的这种情况, 切换 on 的状态的时候, Demo 组件是 **不会** 卸载的，所以 num 的值 100 是传不过去的。

```jsx
const [on, toggle] = useToggle(true)
return <div>{on ? <Demo num={0} /> : <Demo num={100} />}</div>
```

## React Hook 执行顺序

```jsx
export default function Demo() {
  const [num, setNum] = useState(1)
  useEffect(() => {
    console.log('useEffect:', num)
    return () => {
      console.log('useEffect unmount:', num)
    }
  }, [num])
  console.log('render:', num)
  return <div onClick={() => setNum(num + 1)}>{num}</div>
}
```

输出如下:

```jsx
// 首次加载输出:
render: 1
useEffect: 1

// 点击按钮输出:
render: 2
useEffect unmount: 1
useEffect: 2

// Demo 组件卸载:
useEffect unmount: 2
```
