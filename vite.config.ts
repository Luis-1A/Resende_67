import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  server: {
    hmr: false
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});
