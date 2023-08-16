import {
  IBaseRPC,
  IRequestOptions,
  IMaybeJsonified,
  IDispatcherHandler,
  Func,
  ISchemas,
} from 'zod-sdk/internal'
import { callRPC } from './callRPC'

export function query<
  F extends Func,
  S extends ISchemas | undefined,
  R extends ReturnType<F>,
>(
  handler: IDispatcherHandler<F, S>,
  fn: (query: F) => R,
  options?: IRequestOptions
) {
  const rpc = fn(handler as any as F) as any as IBaseRPC
  return callRPC(
    {
      ...rpc,
      type: 'query',
    },
    options
  ) as IMaybeJsonified<S, R>
}
