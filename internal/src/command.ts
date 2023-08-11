import {
  Func,
  IBaseRPC,
  IDispatcherHandler,
  IMaybeJsonified,
  IRequestOptions,
} from 'zod-sdk/internal'
import { callRPC } from './callRPC'

export function command<
  D extends IDispatcherHandler,
  F extends D extends IDispatcherHandler<infer _F> ? _F : never,
  S extends D extends IDispatcherHandler<Func, infer _S> ? _S : never,
  R extends ReturnType<F>,
>(handler: D, fn: (query: F) => R, options?: IRequestOptions) {
  const rpc = fn(handler as any as F) as any as IBaseRPC
  return callRPC(
    {
      ...rpc,
      type: 'command',
    },
    options
  ) as IMaybeJsonified<S, R>
}
