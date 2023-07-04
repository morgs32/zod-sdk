// / <reference types="vitest" />
import { defineConfig } from 'vite';

const fileName = {
  es: 'index.mjs',
  cjs: 'index.cjs',
};

const formats = Object.keys(fileName) as Array<keyof typeof fileName>;

module.exports = defineConfig({
  base: './',
  build: {
    lib: {
      entry: 'src/client/index.ts',
      formats,
      fileName: (format) => `client/${fileName[format]}`,
    },
  },
  test: {
    include: ['**/*.test.ts'],
    globals: true
  },
});