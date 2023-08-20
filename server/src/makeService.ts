import { asyncLocalStorage } from './asyncLocalStorage'
import { makeRouter } from './makeRouter'
import {
  IRequestType,
  IMiddlewareFn,
  IContextFn,
  IProcedure,
  IRPCType,
  ISchemas,
  IFunc,
} from './types'

export type IServiceFunc<S extends any = any, I extends any = any> = (
  this: S,
  input: I
) => Promise<any>

interface IOptions<
  F extends IFunc,
  S extends ISchemas<F> | undefined,
  R extends IRequestType,
  C extends any,
  M extends IContextFn<R, C> | undefined,
  T extends IRPCType = 'query',
> {
  type?: T
  schemas?: S
  makeContext?: M
  middleware?: IMiddlewareFn
}

export type IMakeProcedure<
  R extends IRequestType = IRequestType,
  C extends any = any,
> = {
  <
    F extends (
      this: Pick<IService<R, C>, 'useCtx'>,
      ...args: any[]
    ) => Promise<any>,
    S extends ISchemas<F> | undefined,
    T extends IRPCType = 'query',
  >(
    fn: F
  ): IProcedure<F, S, T, C>
  <
    F extends IServiceFunc<Pick<IService<R, C>, 'useCtx'>>,
    S extends ISchemas<F> | undefined,
    M extends IContextFn,
    O extends IOptions<F, S, R, C, M, T>,
    T extends IRPCType = 'query',
  >(
    fn: F,
    options?: O
  ): IProcedure<F, S, T, M>
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
    makeProcedure: function (
      this: Pick<IService<R, C>, 'useCtx'>,
      fn,
      options
    ) {
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
