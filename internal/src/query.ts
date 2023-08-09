import { IHandler, IBaseRPC, IRequestOptions, Func } from 'zod-sdk/internal'
import { callRPC } from './callRPC'
import { Jsonify } from 'type-fest'

export function query<
  H extends IHandler,
  F extends H extends IHandler<infer T> ? T : never,
  S extends H extends IHandler<Func, infer T> ? T : never,
  R extends ReturnType<F>,
>(handler: H, fn: (query: F) => R, options?: IRequestOptions) {
  const rpc = fn(handler as any as F) as any as IBaseRPC
  return callRPC(
    {
      ...rpc,
      type: 'query',
    },
    options
  ) as S extends undefined ? Promise<Jsonify<Awaited<R>>> : R
}
