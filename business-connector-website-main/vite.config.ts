import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: '/', // Fixed: Proper paths in prod - stops blank page
  build: { target: 'esnext' }, // Modern JS for Vercel
  server: { open: true }, // Auto-open browser local
  root: path.resolve(__dirname, 'client'), // Point to client directory
  publicDir: path.resolve(__dirname, 'client', 'public'),
  build: {
    outDir: path.resolve(__dirname, 'dist/public'),
    emptyOutDir: true,
  },
});
