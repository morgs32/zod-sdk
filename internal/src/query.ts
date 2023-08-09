import { IHandler, IBaseRPC, IRequestOptions } from 'zod-sdk/internal'
import { callRPC } from './callRPC'
import { Jsonify } from 'type-fest'

export function query<
  H extends IHandler,
  F extends H extends IHandler<infer T> ? T : never,
  R extends ReturnType<F>,
>(
  handler: H,
  fn: (query: F) => R,
  options?: IRequestOptions
): Promise<Jsonify<Awaited<R>>> {
  const rpc = fn(handler as any as F) as any as IBaseRPC
  return callRPC(
    {
      ...rpc,
      type: 'query',
    },
    options
  ) as Promise<Jsonify<Awaited<R>>>
}
