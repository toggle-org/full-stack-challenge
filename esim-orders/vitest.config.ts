import { resolve } from 'path';
import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  cacheDir: resolve(__dirname, 'node_modules/.vite'),
  test: {
    globals: true,
    environment: 'node',
    root: './src',
    include: ['**/*.spec.ts'],
    setupFiles: ['./test-utils/setup.ts'],
    fileParallelism: false,
    env: {
      DB_NAME: 'esim_orders_test',
      ESIM_PROVIDER_LATENCY_MS: '0',
    },
    server: {
      deps: {
        inline: ['@nestjs/config', '@nestjs/common', '@nestjs/core'],
      },
    },
  },
  plugins: [swc.vite()],
});
