import { IInterfaceProcedure } from 'zod-sdk/internal'
import { callRPC } from './callRPC'
import { Jsonify } from 'type-fest'
import {
  IFunc,
  IRPCType,
  IRequestOptions,
  IBaseRPC,
  ICompleteRPC,
} from 'zod-sdk/server'
import { ZodType } from 'zod'

export type IMaybeJsonified<F extends IFunc, R> = F extends {
  payload: ZodType<Awaited<ReturnType<F>>>
}
  ? R
  : Promise<Jsonify<R>>

export function call<
  F extends IFunc,
  T extends IRPCType,
  R extends ReturnType<F>,
  C extends any = any,
>(
  procedure: IInterfaceProcedure<F, T, C>,
  fn: T extends 'query'
    ? (bag: { query: F; useCtx: () => C }) => R
    : (bag: { command: F; useCtx: () => C }) => R,
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
    useCtx: (): any => {
      console.error(
        'Hmm, you should not be calling useCtx from the call() method'
      )
      return
    },
  }) as ICompleteRPC
  return callRPC(rpc, options) as IMaybeJsonified<F, R>
}
