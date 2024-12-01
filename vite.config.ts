import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    open: true,
    port: 3001, // 開發伺服器埠號
  },
  build: {
    outDir: 'dist', // 指定構建輸出目錄
    rollupOptions: {
      input: './src/main.tsx' // 指定入口文件
    }
  }
});
