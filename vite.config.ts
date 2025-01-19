import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    target: ['es2020'],
    sourcemap: process.env.NODE_ENV === 'development',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: process.env.NODE_ENV === 'production',
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-ui': ['@tanstack/react-query', 'react-hot-toast', 'lucide-react'],
          'vendor-utils': ['date-fns', 'zustand']
        }
      }
    }
  },
  server: {
    port: 5173,
    host: true,
    hmr: {
      overlay: true,
      clientPort: 5173,
      timeout: 30000,
      protocol: 'ws'
    },
    watch: {
      usePolling: true,
      interval: 1000
    }
  },
  preview: {
    port: 5173,
    host: true
  },
  optimizeDeps: {
    include: [
      '@supabase/supabase-js',
      '@tanstack/react-query',
      'react-router-dom',
      'zustand',
      'date-fns'
    ],
    exclude: ['@supabase/functions-js']
  },
  esbuild: {
    target: 'es2020'
  }
});