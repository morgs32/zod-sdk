import { defineConfig } from 'vitest/config';

module.exports = defineConfig({
  base: './',
  test: {
    include: ['**/*.test.ts'],
    globals: true
  },
});