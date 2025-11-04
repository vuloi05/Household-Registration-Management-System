import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const port = env.SHEETS_PROXY_PORT || '5175'
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/sheets-proxy': {
          target: `http://localhost:${port}`,
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/sheets-proxy/, ''),
        },
      },
    },
  }
})
