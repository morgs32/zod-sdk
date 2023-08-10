import { makeRouter } from './makeRouter'
import { makeService } from './makeService'
import { makeCommand } from './makeCommand'
import { makeQuery } from './makeQuery'

export * from './callHandler'
export const server = { makeRouter, makeService, makeCommand, makeQuery }
