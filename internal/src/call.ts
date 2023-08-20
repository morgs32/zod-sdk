import {
  IBaseRPC,
  IRequestOptions,
  IInterfaceProcedure,
  IFunc,
  ISchemas,
  IRPCType,
  ICompleteRPC,
} from 'zod-sdk/internal'
import { callRPC } from './callRPC'
import { Jsonify } from 'type-fest'

export type IMaybeJsonified<
  S extends ISchemas | undefined,
  R extends any,
> = S extends undefined ? Promise<Jsonify<Awaited<R>>> : R

export function call<
  F extends IFunc,
  S extends ISchemas | undefined,
  T extends IRPCType,
  R extends ReturnType<F>,
>(
  procedure: IInterfaceProcedure<F, S, T>,
  fn: T extends 'query' ? (bag: { query: F }) => R : (bag: { command: F }) => R,
  options?: IRequestOptions
) {
  // Remember, procedure is actually a proxy function that makes an RPC
  const makeRPC = procedure as any as (...args: any[]) => IBaseRPC
  const curry =
    (type: IRPCType) =>
    (...args: any[]) => ({ ...makeRPC(...args), type })
  const rpc = fn({
    query: curry('query') as any as F,
    command: curry('command') as any as F,
  }) as ICompleteRPC
  return callRPC(rpc, options) as IMaybeJsonified<S, R>
}
