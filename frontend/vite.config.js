import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Define __dirname for ES modules
const __dirname = path.dirname(new URL(import.meta.url).pathname);

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxImportSource: '@emotion/react',
      babel: {
        plugins: ['@emotion/babel-plugin'],
      },
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: true,
    host: true,
    strictPort: true,
    historyApiFallback: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/auth': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/users': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/api/courses': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/assignments': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/certificates': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/meetings': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/notifications': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/articles': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/extras': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/content': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/store': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/reviews': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/permissions': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    port: 5173,
    strictPort: true,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          mui: ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
          antd: ['antd', '@ant-design/icons'],
          utils: ['axios', 'dayjs', 'date-fns', 'yup', 'formik'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    target: 'es2015',
  },
  define: {
    'process.env': {}
  },
  optimizeDeps: {
    include: [
      '@mui/material',
      '@mui/icons-material',
      '@emotion/react',
      '@emotion/styled',
      'react',
      'react-dom',
      'react-router-dom',
    ],
    esbuildOptions: {
      // Enable esbuild polyfill for Node.js global variables
      define: {
        global: 'globalThis',
      },
    },
  },
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
  },
})
