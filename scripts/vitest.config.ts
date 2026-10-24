import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

const SERVER = resolve(import.meta.dirname, '../apps/server');

export default defineConfig({
  test: {
    name: 'provision',
    isolate: false,
    environment: 'node',
    include: ['**/*.test.ts']
  },
  resolve: {
    alias: [
      { find: '@/generated', replacement: resolve(SERVER, 'generated') },
      { find: /^@\//, replacement: `${resolve(SERVER, 'src')}/` }
    ]
  }
});
