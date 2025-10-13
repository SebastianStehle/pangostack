import path from 'path';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
import react from '@vitejs/plugin-react';
import mkcert from 'vite-plugin-mkcert';
import tailwindcss from '@tailwindcss/vite';;

const dirName = fileURLToPath(new URL('.', import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    chunkSizeWarningLimit: 3000,
    sourcemap: true,
  },
  resolve: {
    alias: {
      'src': path.resolve(dirName, './src'),
    }
  },
  plugins: [mkcert(), react(), tailwindcss()],
})
