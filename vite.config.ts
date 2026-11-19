import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { cpSync, existsSync, readdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, URL } from 'node:url';

const API_PORT = Number(process.env.API_PORT ?? 3001);

// Bind mounts em Docker Desktop (Windows/macOS) não propagam eventos de FS,
// então o polling é habilitado via variável de ambiente no docker-compose.
const usePolling = process.env.CHOKIDAR_USEPOLLING === 'true';

/**
 * Copia public/ para dist/ excluindo public/manuals/ (~400 MB de PDFs).
 * No Docker (Express 5), os PDFs são servidos direto de public/manuals/.
 * No Tauri, os PDFs são empacotados exclusivamente via bundle.resources.
 */
function copyPublicWithoutManuals(): Plugin {
  const rootDir = fileURLToPath(new URL('.', import.meta.url));
  const publicDir = path.join(rootDir, 'public');
  const outDir = path.join(rootDir, 'dist');

  return {
    name: 'copy-public-without-manuals',
    apply: 'build',
    closeBundle() {
      if (!existsSync(publicDir)) return;
      for (const entry of readdirSync(publicDir, { withFileTypes: true })) {
        if (entry.name.toLowerCase() === 'manuals') continue;
        const src = path.join(publicDir, entry.name);
        const dest = path.join(outDir, entry.name);
        cpSync(src, dest, { recursive: true, force: true });
      }
      const distManuals = path.join(outDir, 'manuals');
      if (existsSync(distManuals)) {
        rmSync(distManuals, { recursive: true, force: true });
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), copyPublicWithoutManuals()],
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
    copyPublicDir: false,
    sourcemap: true,
  },
});
