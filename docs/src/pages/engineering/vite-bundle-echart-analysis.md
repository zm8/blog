# Vite 打包 ECharts 大小分析

## 打包输出文件的大小

### 1.没引入 `Echarts`

基本就是 `vue` 源码的包大小

```
dist/esm/index.js  58.06 kB │ gzip: 18.36 kB
dist/cjs/index.js  39.05 kB │ gzip: 14.83 kB
dist/umd/index.js  39.28 kB │ gzip: 14.92 kB
```

### 2.全局导入 `Echarts`

```js
import * as echarts from "echarts";
```

```
dist/esm/index.js  1,602.42 kB │ gzip: 439.45 kB
dist/cjs/index.js  1,102.40 kB │ gzip: 367.20 kB
dist/umd/index.js  1,102.66 kB │ gzip: 367.23 kB
```

### 3.按需引入 `Echarts`, 包括 `LineChart` `PieChart` `BarChart`

```js
import * as echarts from "echarts/core";
import {
  GridComponent,
  LegendComponent,
  TitleComponent,
  ToolboxComponent,
  TooltipComponent
} from "echarts/components";
import { LineChart, PieChart, BarChart } from "echarts/charts";
import { CanvasRenderer } from "echarts/renderers";

echarts.use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  ToolboxComponent,
  LineChart,
  PieChart,
  BarChart,
  CanvasRenderer
]);
```

```
dist/esm/index.js  901.98 kB │ gzip: 250.79 kB
dist/cjs/index.js  625.69 kB │ gzip: 211.95 kB
dist/umd/index.js  625.94 kB │ gzip: 212.03 kB
```

### 4.按需引入 `Echarts`, 只包含 `LineChart` 和它的相关组件

```js
echarts.use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  ToolboxComponent,
  LineChart,
  CanvasRenderer
]);
```

```
dist/esm/index.js  844.38 kB │ gzip: 233.95 kB
dist/cjs/index.js  587.78 kB │ gzip: 198.88 kB
dist/umd/index.js  588.03 kB │ gzip: 198.94 kB
```

### 5.按需引入 `Echarts`, 仅加载 `LineChart` 所需的最小组件

```js
echarts.use([GridComponent, LineChart, CanvasRenderer]);
```

```
dist/esm/index.js  709.97 kB │ gzip: 196.89 kB
dist/cjs/index.js  495.88 kB │ gzip: 168.40 kB
dist/umd/index.js  496.14 kB │ gzip: 168.48 kB
```

## 结论

其实封装一个包含 `LineChart` `PieChart` `BarChart` 的组件, 和分开封装 `LineChart`, `PieChart`, `BarChart` 的体积是差不多的。
