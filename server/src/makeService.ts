import { IncomingMessage } from 'http'
import {
  Func,
  IContextFn,
  IHandler,
  IMiddlewareFn,
  ISchemas,
} from 'zod-sdk/internal'
import { asyncLocalStorage } from './asyncLocalStorage'

export function makeService<R extends IncomingMessage | Request, C extends any>(
  options: {
    middleware?: IMiddlewareFn<R>
    makeContext?: IContextFn<R, C>
  } = {}
) {
  const { middleware, makeContext } = options

  return {
    makeQuery: function makeQuery<F extends Func>(
      procedure: F,
      schemas?: ISchemas<F>
    ): IHandler<F> {
      return {
        procedure,
        middleware,
        makeContext,
        schemas,
        type: 'query',
      }
    },
    makeCommand: function makeCommand<F extends Func>(
      procedure: F,
      schemas?: ISchemas<F>
    ): IHandler<F> {
      return {
        procedure,
        middleware,
        makeContext,
        schemas,
        type: 'command',
      }
    },
    useCtx: function useCtx() {
      return asyncLocalStorage.getStore() as Awaited<C>
    },
    mockCtx: function mockCtx<T extends any>(
      ctx: Awaited<C>,
      fn: () => Promise<T>
    ): Promise<T> {
      return asyncLocalStorage.run(ctx, fn)
    },
  }
}
