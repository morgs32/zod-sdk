import { JsonValue } from 'type-fest'
import { IFunc, IRPCType, ISchemas, IContextFn, IProcedure } from './types'

/**
 * If you don't pass schemas to makeQuery or makeComment,
 * then your argument needs to be JSON compatible (no dates)
 */
export interface ValidJsonOrSchemasRequired {}

interface IProps<
  F extends IFunc,
  S extends ISchemas<F> | undefined,
  M extends IContextFn | undefined,
  T extends IRPCType = 'query',
> {
  type?: T
  schemas?: S
  makeContext?: M
  middleware?: any // TODO: fix
}

export function makeProcedure<F extends IFunc>(
  fn: F
): F extends IFunc<infer P>
  ? P extends JsonValue[]
    ? IProcedure<F, undefined, 'query'>
    : ValidJsonOrSchemasRequired
  : never
export function makeProcedure<
  F extends IFunc,
  S extends ISchemas<F> | undefined,
  M extends IContextFn | undefined,
  O extends IProps<F, S, M, T>,
  T extends IRPCType = 'query',
>(
  fn: F,
  options?: O
): 'schemas' extends keyof O
  ? IProcedure<F, S, T>
  : F extends IFunc<infer P>
  ? P extends JsonValue[]
    ? IProcedure<F, S, T>
    : ValidJsonOrSchemasRequired
  : never
export function makeProcedure<
  F extends IFunc,
  S extends ISchemas<F> | undefined,
  M extends IContextFn | undefined,
  T extends IRPCType = 'query',
>(
  fn: F,
  options?: {
    type?: T
    schemas?: S
    makeContext?: M
    middleware?: any // TODO: fix
  }
): S extends undefined
  ? F extends IFunc<infer P>
    ? P extends JsonValue[]
      ? IProcedure<F, S, T>
      : ValidJsonOrSchemasRequired
    : never
  : IProcedure<F, S, T> {
  return {
    fn,
    type: 'query' as T,
    ...options,
  }
}
