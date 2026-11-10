import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  clearScreen: false,
  build: {
    // Windows 7 only supports WebView2 v109 (Chromium 109)
    target: 'chrome109',
  },
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': { target: 'http://localhost:8000', changeOrigin: true, ws: true },
    },
  },
})
