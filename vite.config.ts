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
    emptyOutDir: false,
    lib: {
      entry: 'src/index.ts',
      formats,
      fileName: (format) => fileName[format],
    },
  },
  test: {
    include: ['**/*.test.ts'],
    globals: true
  },
});