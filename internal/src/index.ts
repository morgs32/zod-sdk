import { command } from './command'
import { query } from './query'
import { makeClient } from './makeClient'
export * from './types'
export * from './isRPC'
export * from './callRPC'

export const sdk = {
  command,
  query,
  makeClient,
}
