# 统一开发环境和生产环境的 vite 中的图片转换逻辑

## 编写一个 vite 的插件

`vite.config.ts`

```ts
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import fs from "node:fs";

const myPlugin = (limit = 10000) => {
  return {
    name: "my-plugin",
    // code 是模块内容, id 是模块的路径
    transform: async (_code, id: string) => {
      // 只在开发环境生效
      if (process.env.NODE_ENV !== "development") return;
      if (!id.endsWith(".png")) return;
      const stat = await fs.promises.stat(id); // 读取图片的大小
      if (stat.size > limit) return;
      const buffer = await fs.promises.readFile(id);
      const base64 = buffer.toString("base64"); // 转成 base64
      const dataurl = `data:image/png;base64,${base64}`;
      // 返回的格式是 rollup 要求的, 是一个带 code 的对象
      return {
        code: `export default "${dataurl}"`
      };
    }
  };
};

const IMG_SIZE = 10000;
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), myPlugin(IMG_SIZE)],
  // 生成环境模式
  build: {
    assetsInlineLimit: IMG_SIZE
  }
});
```
