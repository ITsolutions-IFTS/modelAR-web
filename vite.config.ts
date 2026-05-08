import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // Allow HTTPS tunnels for testing AR on physical devices
  server: {
    allowedHosts: ['localhost', '.ngrok-free.app', '.ngrok.io', '.loca.lt'],
  },
})
