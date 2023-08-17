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

  function makeQuery<F extends Func>(procedure: F): IHandler<F>
  function makeQuery<F extends Func, S extends ISchemas<F>>(
    procedure: F,
    schemas: S
  ): IHandler<F, S>
  function makeQuery<F extends Func, S extends ISchemas<F>>(
    procedure: F,
    schemas?: S
  ): IHandler<F, S | undefined> {
    return {
      procedure,
      middleware,
      makeContext,
      schemas,
      type: 'query',
    }
  }

  function makeCommand<F extends Func, S extends ISchemas<F>>(
    procedure: F,
    schemas?: S
  ): IHandler<F, S | undefined> {
    return {
      procedure,
      middleware,
      makeContext,
      schemas,
      type: 'command',
    }
  }

  return {
    makeQuery,
    makeCommand,
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
