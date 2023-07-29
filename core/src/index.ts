export * as client from './client'

let server
if (typeof process === 'object') {
  server = require('./server')
}
export {
  server
}