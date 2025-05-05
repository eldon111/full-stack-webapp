import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: parseInt(env.PORT || '5173', 10),
      host: true, // Listen on all addresses
    },
    preview: {
      port: parseInt(env.PORT || '4173', 10),
      host: true, // Listen on all addresses
    },
    build: {
      // Optimize build for static hosting
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: false,
      // Generate a manifest file for asset management
      manifest: true,
      // Optimize chunk size
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router', '@tanstack/react-query', '@trpc/client', '@trpc/server'],
          },
        },
      },
    },
  };
});
