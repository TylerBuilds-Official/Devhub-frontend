import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import net from 'node:net'


const LOCAL_API_HOST   = 'localhost'
const LOCAL_API_PORT   = 8766
const PROBE_TIMEOUT_MS = 800


// TCP connect probe — catches the common "nothing listening" case
// (ECONNREFUSED) instantly. Won't notice a wedged process that accepts
// TCP but never answers HTTP; if that ever bites, swap for a fetch.
async function localApiReachable(): Promise<boolean> {
  return new Promise(resolve => {
    const sock = net.createConnection({
      host:    LOCAL_API_HOST,
      port:    LOCAL_API_PORT,
      timeout: PROBE_TIMEOUT_MS,
    })

    const settle = (ok: boolean) => {
      sock.destroy()
      resolve(ok)
    }

    sock.once('connect', () => settle(true))
    sock.once('timeout', () => settle(false))
    sock.once('error',   () => settle(false))
  })
}


export default defineConfig(async ({ mode }) => {
  const env          = loadEnv(mode, process.cwd(), '')
  const localTarget  = `http://${LOCAL_API_HOST}:${LOCAL_API_PORT}`
  const remoteTarget = env.VITE_DEV_FALLBACK_API_URL || 'https://10.0.0.12:8001'

  const localUp     = await localApiReachable()
  const proxyTarget = localUp ? localTarget : remoteTarget

  console.log(
    localUp
      ? `\n[devhub] local API ${localTarget} is up — /api → ${localTarget}\n`
      : `\n[devhub] local API ${localTarget} unreachable — falling back to ${remoteTarget}\n`
  )

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5174,
      proxy: {
        '/api': {
          target:       proxyTarget,
          changeOrigin: true,
          // Fallback target uses a self-signed cert on a raw IP; the
          // browser never sees this connection (proxy → API is server-
          // side), so skipping verification here is dev-only and safe.
          secure:       false,
          rewrite:      (p: string) => p.replace(/^\/api/, ''),
        },
      },
    },
  }
})
