import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/userapi": {
        target: "https://my.sepay.vn",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/userapi/, "/userapi"),
      },
    },
  },
  define: {
    // By default, Vite doesn't include shims for NodeJS/
    // necessary for segment analytics lib to work
    global: {},
  },
})
