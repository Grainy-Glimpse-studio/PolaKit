import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: ['opencv.js'],
  },
  worker: {
    format: 'iife',
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'pdf': ['jspdf'],
          'zip': ['jszip'],
        },
      },
    },
  },
});
