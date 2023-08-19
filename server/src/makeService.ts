import { IncomingMessage } from 'http'
import { IContextFn, IMiddlewareFn, IRPCType, ISchemas } from 'zod-sdk/internal'
import { asyncLocalStorage } from './asyncLocalStorage'
import { makeProcedure } from './makeProcedure'
import { makeRouter } from './makeRouter'

type IServiceFunc<S extends any = any, I extends any = any> = (
  this: S,
  input: I
) => Promise<any>

type IMakeProcedure<
  R extends IncomingMessage | Request = IncomingMessage | Request,
  C extends any = any,
> = {
  <
    F extends IServiceFunc<IService<R, C>>,
    S extends ISchemas<F>,
    M extends IContextFn<R, C>,
    T extends IRPCType = 'query',
  >(
    fn: F,
    options?: {
      type?: T
      schemas?: S
      makeContext?: M
      middleware?: any // TODO: fix
    }
  ): ReturnType<typeof makeProcedure<F, T>>
}
export interface IService<
  R extends IncomingMessage | Request = IncomingMessage | Request,
  C extends any = any,
> {
  middleware?: IMiddlewareFn<R>
  makeContext?: IContextFn<R, C>
  makeProcedure: IMakeProcedure<R, C>
  makeRouter: typeof makeRouter
  useCtx: () => Awaited<C>
  mockCtx: (ctx: Awaited<C>, fn: (this: this) => Promise<any>) => Promise<any>
}

export function makeService<R extends IncomingMessage | Request, C extends any>(
  options: {
    middleware?: IMiddlewareFn<R>
    makeContext?: IContextFn<R, C>
  } = {}
): IService<R, C> {
  const { middleware, makeContext } = options

  return {
    middleware,
    makeContext,
    makeProcedure: function makeProcedure(fn, options) {
      return makeProcedure(fn.bind(this), {
        makeContext,
        middleware,
        ...options,
      })
    },
    makeRouter: function (
      this: IService<R, C>,
      ...args: Parameters<typeof makeRouter>
    ) {
      return makeRouter(...args)
    },
    useCtx: function useCtx() {
      return asyncLocalStorage.getStore() as Awaited<C>
    },
    mockCtx: function mockCtx(
      ctx: Awaited<C>,
      fn: () => Promise<any>
    ): Promise<any> {
      return asyncLocalStorage.run(ctx, fn.bind(this))
    },
  }
}
