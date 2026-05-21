import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

const SKETCHFAB_API_KEY = process.env.SKETCHFAB_API_KEY;

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    allowedHosts: ['localhost', '.ngrok-free.app', '.ngrok.io', '.loca.lt'],
    proxy: {
      '/api/sketchfab': {
        target: 'https://api.sketchfab.com/v3',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/sketchfab/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            if (SKETCHFAB_API_KEY) {
              proxyReq.setHeader('Authorization', `Token ${SKETCHFAB_API_KEY}`);
            }
          });
        },
      },
    },
  },
});
