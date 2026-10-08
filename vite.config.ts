import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('./site', import.meta.url));
export default defineConfig({
  root,
  envDir: false,
  build: { outDir: '../dist', emptyOutDir: true, target: 'es2022' },
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    fs: {
      strict: true,
      allow: [root, fileURLToPath(new URL('./node_modules', import.meta.url))],
      deny: ['**/.env*', '**/.git/**', '**/.local/**', '**/scripts/**', '**/Textdokument*', '**/index.ts'],
    },
  },
});
