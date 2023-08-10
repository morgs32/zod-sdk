export * from 'zod-sdk/internal'
let server: (typeof import('zod-sdk/server'))['server']
let useQuery: (typeof import('zod-sdk/client'))['useQuery']
if (typeof process === 'object') {
  server = require('zod-sdk/server').server
} else {
  useQuery = require('zod-sdk/client').useQuery
}
export { server, useQuery }
