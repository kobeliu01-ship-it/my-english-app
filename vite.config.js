import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// 注意：localhost 本身已是安全上下文（Secure Context），
// navigator.mediaDevices.getUserMedia 无需 HTTPS 即可工作。
// 如需局域网其他设备访问麦克风，才需要加 https: true。
export default defineConfig({
  plugins: [react()],
  server: {
    host: "localhost",
  },
})
