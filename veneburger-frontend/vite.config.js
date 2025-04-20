import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@pages': path.resolve(__dirname, './src/pages'),
        '@services': path.resolve(__dirname, './src/services'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@context': path.resolve(__dirname, './src/context'),
        '@assets': path.resolve(__dirname, './src/assets'),
      },
    },
    server: {
      port: parseInt(env.VITE_FRONTEND_PORT || '3002'),
      open: true,
    },
    build: {
      outDir: 'build',
      sourcemap: mode === 'development',
      chunkSizeWarningLimit: 1000,
    }
  }
});