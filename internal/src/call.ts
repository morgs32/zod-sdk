import {
  IBaseRPC,
  IRequestOptions,
  IMaybeJsonified,
  IInstructionsHandler,
  Func,
  ISchemas,
  IType,
} from 'zod-sdk/internal'
import { callRPC } from './callRPC'

export function call<
  F extends Func,
  S extends ISchemas | undefined,
  T extends IType,
  R extends ReturnType<F>,
>(
  handler: IInstructionsHandler<F, S, T>,
  fn: T extends 'query' ? (bag: { query: F }) => R : (bag: { command: F }) => R,
  options?: IRequestOptions
) {
  const makeRPC = handler as any as (...args: any[]) => IBaseRPC
  const curry =
    (type: IType) =>
    (...args: any[]) => ({ ...makeRPC(...args), type })
  const rpc = fn({
    query: curry('query') as any as F,
    command: curry('command') as any as F,
  }) as IBaseRPC
  return callRPC(
    {
      ...rpc,
      type: 'query',
    },
    options
  ) as IMaybeJsonified<S, R>
}
