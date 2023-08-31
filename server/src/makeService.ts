import { asyncLocalStorage } from './asyncLocalStorage'
import { Check } from './makeProcedure'
import { IRequestType, IMiddlewareFn, IContextFn, IFunc } from './types'

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
  public makeQuery<F extends IFunc<C>>(fn: F) {
    const bound = fn.bind({
      useCtx: () => asyncLocalStorage.getStore() as Awaited<C>,
    }) as F
    Object.assign(bound, fn) // Because bind wipes off properties https://stackoverflow.com/questions/64383695/using-function-prototype-bind-causes-the-original-properties-to-be-lost
    return {
      fn: bound,
      type: 'query',
      ...this.options,
    } as any as Check<F, 'query', C, R>
  }
  public makeCommand<F extends IFunc<C>>(fn: F) {
    const bound = fn.bind({
      useCtx: () => asyncLocalStorage.getStore() as Awaited<C>,
    }) as F
    Object.assign(bound, fn)
    return {
      fn: bound,
      type: 'command',
      ...this.options,
    } as any as Check<F, 'command', C, R>
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
