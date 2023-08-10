import {
  IHandler,
  IBaseRPC,
  IRequestOptions,
  Func,
  IClientHandler,
} from 'zod-sdk/internal'
import { callRPC } from './callRPC'
import { Jsonify } from 'type-fest'

export function query<
  C extends IClientHandler,
  H extends C extends IClientHandler<infer T> ? T : never,
  F extends H extends IHandler<infer T> ? T : never,
  S extends H extends IHandler<Func, infer T> ? T : never,
  R extends ReturnType<F>,
>(handler: C, fn: (query: F) => R, options?: IRequestOptions) {
  const rpc = fn(handler as any as F) as any as IBaseRPC
  return callRPC(
    {
      ...rpc,
      type: 'query',
    },
    options
  ) as S extends undefined ? Promise<Jsonify<Awaited<R>>> : R
}
