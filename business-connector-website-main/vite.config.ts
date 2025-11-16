import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: '/', // Fixed: Proper paths for Vercel - stops blank
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
