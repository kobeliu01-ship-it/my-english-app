import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import legacy from '@vitejs/plugin-legacy'

// https://vite.dev/config/
// 注意：localhost 本身已是安全上下文（Secure Context），
// navigator.mediaDevices.getUserMedia 无需 HTTPS 即可工作。
// 如需局域网其他设备访问麦克风，才需要加 https: true。
export default defineConfig({
  base: '/my-english-app/',
  plugins: [
    react(),
    legacy({
      targets: ['ios >= 13', 'safari >= 13'],
    }),
  ],
  server: {
    host: "localhost",
  },
})
