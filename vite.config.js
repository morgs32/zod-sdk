const { defineConfig } = require('vitest/config')

const fileName = {
  es: 'index.mjs',
  cjs: 'index.cjs',
};

const formats = Object.keys(fileName)

module.exports = defineConfig({
  base: './',
  build: {
    lib: {
      entry: [
        'src/client/client.ts',
        'src/server/server.ts',
      ],
      formats,
      fileName: (format, entryName) => {
        return `${entryName}/${fileName[format]}`
      },
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: [
        'async_hooks',
        'node:async_hooks',
        'string_decoder',
        'buffer',
        'raw-body',
        'http',
        'superjson',
        'zod',
        'swr'
      ],
    }
  },
  test: {
    include: ['**/*.test.ts'],
    globals: true
  },
});