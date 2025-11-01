import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "0.0.0.0",
    watch: {
      // 檔案監控設定
      usePolling: true, // 使用輪詢方式監控檔案變更
      interval: 1000, // 每1000毫秒（1秒）檢查一次檔案變更
    },
  },
});
