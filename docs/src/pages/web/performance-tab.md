# Performance 选项卡

访问 Chrome 浏览器官方提供的示例程序网址：

`https://googlechrome.github.io/devtools-samples/jank/`

点击左侧的按钮 `Add 10` 增加小球数量。接着，切换到 Chrome 浏览器的 `Performance` 选项卡，点击 `Record` 按钮开始录制。

<img width="708" alt="image" src="https://github.com/user-attachments/assets/b2f74a91-a0c2-46c7-871c-ed4992f16788">

## 1. 红色条

在性能分析报告中，如果看到`红色条`，说明该区域存在性能问题。红色条表示该部分的渲染帧率低于标准帧率，一般来说，标准帧率是每秒 `60` 次。如果出现红色条，意味着该部分的帧率已经下降，低于每秒 `60` 次。

<img width="765" alt="image" src="https://github.com/user-attachments/assets/b016054e-c276-4eef-baf5-fbef8874e845">

## 2. CPU 占用情况

下面展示的是 `CPU` 的占用情况。不同颜色的波浪代表不同的占用比例，波浪的高度表示 `CPU` 占用的百分比。

<img width="762" alt="image" src="https://github.com/user-attachments/assets/996e452d-cb9d-4be9-a84a-d22395d332db">

点击主线程 `Main` 横条，下面会出现一个环形图，表示主线程的占用情况。黄色区域代表 JavaScript 脚本的执行，紫色区域代表 `Rendering` 渲染，它的占用时间较长。

<img width="760" alt="image" src="https://github.com/user-attachments/assets/e5d2cc19-5132-4855-99cb-3f9823996abb">

## 3.Frames 帧率

拖动时间线并点击放大镜按钮，可以缩短时间线，精确查看每一帧的情况。

<img width="756" alt="image" src="https://github.com/user-attachments/assets/cea5dc82-c08c-413b-802e-94cdbb740ecf">

下面的区域展示了这一段时间线内发生的所有事件。在 `Frames` 的横条上，帧率的标准值应为 `16.7` 毫秒。`绿色`表示正常帧率，`黄色`则表示该帧未能完全渲染，属于`部分渲染帧`（Partially-presented frame）。

<img width="767" alt="image" src="https://github.com/user-attachments/assets/ac1f9f78-85b5-4cb6-bca0-7f60a5b0e832">

## 4. 主线程

`Main` 区域表示主线程的执行情况，包括 JavaScript 代码运行、DOM 树生成、样式计算等操作。主线程受事件循环机制影响，每个任务都是按顺序执行的。

点击其中一个 `Task`，可以查看该任务正在执行的内容，例如 `Animation Frame Fired`，表示触发了 `requestAnimationFrame` 事件。事件下方的 `Function call` 表示浏览器正在调用一个方法，这里调用的是 `anonymous` 函数。

<img width="863" alt="image" src="https://github.com/user-attachments/assets/96a6434a-8085-404b-9212-1b9512b1c846">

点击 `anonymous` 函数，切换到下方的 `Call Tree` 选项卡，查看调用树，显示该方法消耗了 `33.5ms`，占用了 `100%` 的时间。

<img width="866" alt="image" src="https://github.com/user-attachments/assets/fc46ab77-eda7-4d66-902e-edb4a985c17e">

展开事件内容后，可以看到具体的性能瓶颈。点击 `app.j`s 文件链接，跳转到 Sources 选项卡，查看具体的代码行。这里显示的是每一行代码执行所花费的时间，你可以看到，读取 `offsetTop` 属性时会触发 Layout 回流，导致性能问题。

<img width="865" alt="image" src="https://github.com/user-attachments/assets/ca8670be-f3ef-495c-a953-b8a58fbbd8a8">

<img width="838" alt="image" src="https://github.com/user-attachments/assets/805aeb40-590a-4e70-8e90-b653099d7902">
