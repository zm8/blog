# 如何动态监听 DOM 元素高度变化

1. 通过内嵌 iframe 到 Wrap 元素里面。 动态监听 iframe 的 onResize 属性变化。
2. Wrap 元素里面内容 动态在不断变多。
3. css 里的 iframe 是撑满整个 wrapper 元素的。

```css
.wrapper {
  position: relative;
}

.ifr {
  width: 0;
  height: 100%;
  position: absolute;
  left: -1px;
  top: 0;
  z-index: -10000;
  pointer-events: none;
}
```

```js
const Details = () => {
  const ref = useRef(null)
  const ifr = useRef(null)
  const [showMore, setShowMore] = useState(false)
  const [intro, setIntro] = useState({})
  const details = intro.details ?? ''

  useEffect(() => {
    const t = setTimeout(() => {
      setIntro({
        details: `<div >
					<p>阿斯顿发阿斯顿发</p>
				</div>`
      })
    }, 1000)
    const t2 = setTimeout(() => {
      setIntro({
        details: `<div >
					<p>阿斯顿发阿斯顿发</p>
					<p>阿斯顿发阿斯顿发</p>
				</div>`
      })
    }, 2000)
    const t3 = setTimeout(() => {
      setIntro({
        details: `<div >
					<p>阿斯顿发阿斯顿发</p>
					<p>阿斯顿发阿斯顿发</p>
					<p>阿斯顿发阿斯顿发</p>
					<p>阿斯顿发阿斯顿发</p>
					<p>阿斯顿发阿斯顿发</p>
					<p>阿斯顿发阿斯顿发</p>
				</div>`
      })
    }, 3000)
    return () => {
      clearTimeout(t)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [])

  useEffect(() => {
    if (!ref.current || !ifr.current?.contentWindow) return
    const onresize = () => {
      console.log('onresize')
      const height = ref.current?.clientHeight ?? 0
      const show = height >= parseInt(MAX_HEIGHT, 10)
      setShowMore(show)
      if (ifr.current && show) {
        ifr.current.remove()
      }
    }
    ifr.current.contentWindow.onresize = onresize
    onresize()
  }, [])

  return (
    <>
      <div className="wrapper">
        <div ref={ref} dangerouslySetInnerHTML={{ __html: details }} />
        <iframe
          ref={ifr}
          title="testIframe"
          src="about:blank"
          className="ifr"
        />
      </div>
      {showMore && <div className="show-more">查看全部</div>}
    </>
  )
}
```

:::参考链接
https://mp.weixin.qq.com/s/TA7bvL3N_HbOqbT0MPrs8w
:::
