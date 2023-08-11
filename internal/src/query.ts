import {
  IBaseRPC,
  IRequestOptions,
  Func,
  IDispatcherHandler,
  IMaybeJsonified,
} from 'zod-sdk/internal'
import { callRPC } from './callRPC'

export function query<
  D extends IDispatcherHandler,
  F extends D extends IDispatcherHandler<infer _F> ? _F : never,
  S extends D extends IDispatcherHandler<Func, infer _S> ? _S : never,
  R extends ReturnType<F>,
>(handler: D, fn: (query: F) => R, options?: IRequestOptions) {
  const rpc = fn(handler as any as F) as any as IBaseRPC
  return callRPC(
    {
      ...rpc,
      type: 'query',
    },
    options
  ) as IMaybeJsonified<S, R>
}
