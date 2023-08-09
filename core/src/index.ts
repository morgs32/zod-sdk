export * as sdk from './sdk'

let server
if (typeof process === 'object') {
  server = require('./server')
}
export { server }
