export { sdk } from 'zod-sdk/internal'
export type {
  InferHandlerFn as infer,
  IHandler,
  IBaseRPC,
  IRequestOptions,
  Func,
} from 'zod-sdk/internal'

let server: (typeof import('zod-sdk/server'))['server']
if (typeof process === 'object') {
  server = require('zod-sdk/server')
}
export { server }
