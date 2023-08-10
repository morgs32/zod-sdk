export * from 'zod-sdk/internal'
let server: (typeof import('zod-sdk/server'))['server']
if (typeof process === 'object') {
  server = require('zod-sdk/server').server
}
export { server }
