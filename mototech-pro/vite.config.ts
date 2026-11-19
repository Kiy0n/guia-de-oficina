import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

const API_PORT = Number(process.env.API_PORT ?? 3001);

// Bind mounts em Docker Desktop (Windows/macOS) não propagam eventos de FS,
// então o polling é habilitado via variável de ambiente no docker-compose.
const usePolling = process.env.CHOKIDAR_USEPOLLING === 'true';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    watch: usePolling ? { usePolling: true, interval: 300 } : undefined,
    proxy: {
      '/api': {
        target: `http://localhost:${API_PORT}`,
        changeOrigin: true,
      },
      '/manuals': {
        target: `http://localhost:${API_PORT}`,
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: true,
    port: 4173,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
  },
});
