import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/', // Fixed: Proper paths in prod - stops blank page
  build: { target: 'esnext' }, // Modern JS for Vercel
  server: { open: true } // Auto-open browser local
});
