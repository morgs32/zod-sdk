import { asyncLocalStorage } from './asyncLocalStorage'
import { makeRouter } from './makeRouter'
import {
  IRequestType,
  IMiddlewareFn,
  IContextFn,
  IProcedure,
  IRPCType,
  ISchemas,
} from './types'

type IServiceFunc<S extends any = any, I extends any = any> = (
  this: S,
  input: I
) => Promise<any>

type IMakeProcedure<
  R extends IRequestType = IRequestType,
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
  ): IProcedure<F, S, T>
}

export interface IService<
  R extends IRequestType = IRequestType,
  C extends any = any,
> {
  middleware?: IMiddlewareFn<R>
  makeContext?: IContextFn<R, C>
  makeProcedure: IMakeProcedure<R, C>
  makeRouter: typeof makeRouter
  useCtx: () => Awaited<C>
  mockCtx: (ctx: Awaited<C>, fn: (this: this) => Promise<any>) => Promise<any>
}

export function makeService<R extends IRequestType, C extends any>(
  options: {
    middleware?: IMiddlewareFn<R>
    makeContext?: IContextFn<R, C>
  } = {}
): IService<R, C> {
  const { middleware, makeContext } = options
  return {
    middleware,
    makeContext,
    makeProcedure: function (this: IService<R, C>, fn, options) {
      return {
        fn: fn.bind(this),
        type: 'query',
        makeContext,
        middleware,
        ...options,
      }
    } as IService<R, C>['makeProcedure'],
    makeRouter,
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
