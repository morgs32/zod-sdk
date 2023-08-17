import { IncomingMessage } from 'http'
import { IContextFn, IMiddlewareFn } from 'zod-sdk/internal'
import { asyncLocalStorage } from './asyncLocalStorage'
import { makeProcedure } from './makeProcedure'

export function makeService<R extends IncomingMessage | Request, C extends any>(
  options: {
    middleware?: IMiddlewareFn<R>
    makeContext?: IContextFn<R, C>
  } = {}
) {
  const { middleware, makeContext } = options

  const _makeProcedure = (...args: Parameters<typeof makeProcedure>) => {
    return {
      ...makeProcedure(...args),
      middleware,
      makeContext,
    }
  }

  return {
    makeProcedure: _makeProcedure as typeof makeProcedure,
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
