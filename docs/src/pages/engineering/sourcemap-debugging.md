# Sourcemap 定位回源代码

## 1. 安装 npm `source-map`

## 2. 执行下面的脚本

```js
const { SourceMapConsumer } = require('source-map');
const fs = require('fs');

const run = async ()=>{
  const rawSourceMap = fs.readFileSync('xxx.js.map', 'utf8');
  const consumer = await new SourceMapConsumer(rawSourceMap);

  const originalPosition = consumer.originalPositionFor({
    line: 1, // 压缩代码的行号
    column: 44152, // 压缩代码的列号
  });

  console.log(originalPosition);
}

run();
```

打印 log 如下:

``` js
{
  source: 'pages/HomeV2/components/RealTimeDataV2/components/ChartBase/PieChart.tsx',
  line: 10,
  column: 14,
  name: 'usePxRate'
}
```

