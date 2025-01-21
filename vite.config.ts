import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'service-worker.ts',
      injectRegister: 'auto',
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
        type: 'module',
        navigateFallback: 'index.html',
      },
      manifest: {
        name: 'JobbyJob',
        short_name: 'JobbyJob',
        description: 'Your AI-powered job search assistant',
        theme_color: '#4F46E5',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: [
          '**/*.{js,css,html,ico,png,svg}',
          'manifest.webmanifest',
          'registerSW.js',
          'icon.svg'
        ],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets',
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              cacheableResponse: {
                statuses: [0, 200]
              },
              expiration: {
                maxAgeSeconds: 60 * 60 * 24 * 365,
                maxEntries: 30
              }
            }
          }
        ],
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/api/, /^\/rest/, /^\/storage/, /^\/auth/],
        cleanupOutdatedCaches: true,
        sourcemap: true
      }
    })
  ],
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
    strictPort: true,
    hmr: {
      host: 'localhost',
      port: 5173,
      clientPort: 5173
    },
    watch: {
      usePolling: true,
      interval: 1000
    }
  },
  preview: {
    port: 5173,
    host: true,
    strictPort: true
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