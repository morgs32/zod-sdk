import { IBaseRPC, IHandler, IRequestOptions } from 'zod-sdk/internal'
import { callRPC } from './callRPC'
import { Jsonify } from 'type-fest'

export function command<
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
      type: 'command',
    },
    options
  ) as Promise<Jsonify<Awaited<R>>>
}
