import { command } from './command'
import { query } from './query'
import { makeSDK } from './makeSDK'
export * from './types'
export * from './isRPC'
export * from './callRPC'

export const sdk = {
  command,
  query,
  makeSDK,
}
