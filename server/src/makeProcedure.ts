import { JsonValue } from 'type-fest'
import {
  IFunc,
  IRPCType,
  ISchemas,
  IContextFn,
  IProcedure,
  IMiddlewareFn,
} from './types'
import { IService } from './makeService'

/**
 * If you don't pass schemas to makeQuery or makeComment,
 * then your argument needs to be JSON compatible (no dates)
 */
export interface ValidJsonOrSchemasRequired {}
export interface MustMakeProcedureWithService {}

interface IOptions<
  F extends IFunc,
  S extends ISchemas<F> | undefined,
  M extends IContextFn | undefined,
  T extends IRPCType = 'query',
> {
  type?: T
  schemas?: S
  makeContext?: M
  middleware?: IMiddlewareFn
}

export function makeProcedure<F extends IFunc, T extends ThisParameterType<F>>(
  fn: F
): T extends IService
  ? MustMakeProcedureWithService
  : F extends IFunc<infer P>
  ? P extends JsonValue[]
    ? IProcedure<F, undefined, 'query'>
    : ValidJsonOrSchemasRequired
  : never
export function makeProcedure<
  F extends IFunc,
  S extends ISchemas<F> | undefined,
  M extends IContextFn | undefined,
  O extends IOptions<F, S, M, T>,
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
): IProcedure {
  return {
    fn,
    type: 'query' as T,
    ...options,
  }
}
