import { asyncLocalStorage } from './asyncLocalStorage'
import {
  IRequestType,
  IMiddlewareFn,
  IContextFn,
  IProcedure,
  IFunc,
} from './types'

export type inferThis<S extends Service<any, any>> = S extends Service<
  any,
  infer C
>
  ? { useCtx: () => Awaited<C> }
  : never

export class Service<
  R extends IRequestType = IRequestType,
  C extends any = any,
> {
  constructor(
    public options: {
      middleware?: IMiddlewareFn<R>
      makeContext?: IContextFn<R, C>
    } = {}
  ) {}
  public makeQuery<F extends IFunc<C>>(fn: F): IProcedure<F, 'query', C, R> {
    return {
      fn: fn.bind({
        useCtx: () => asyncLocalStorage.getStore() as Awaited<C>,
      }) as F,
      type: 'query',
      ...this.options,
    }
  }
  public makeCommand<F extends IFunc<C>>(
    fn: F
  ): IProcedure<F, 'command', C, R> {
    return {
      fn: fn.bind({
        useCtx: () => asyncLocalStorage.getStore() as Awaited<C>,
      }) as F,
      type: 'command',
      ...this.options,
    }
  }
}

export function makeService<R extends IRequestType, C extends any>(
  options: {
    middleware?: IMiddlewareFn<R>
    makeContext?: IContextFn<R, C>
  } = {}
): Service<R, C> {
  return new Service(options)
}
