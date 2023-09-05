import { JsonValue } from 'type-fest'
import { IFunc, IProcedure, IRPCType, IRequestType } from './types'
import { ZodType } from 'zod'

/**
 * If you don't pass schemas to makeQuery or makeComment,
 * then your argument needs to be JSON compatible (no dates)
 */
export interface ValidJsonOrSchemasRequired {}
export interface MustMakeProcedureWithService {}

export type inferParameters<T = any> = {
  parameters: ZodType<T>
}

/**
 * ====================
 * The below is copied from zod-utils/check
 * ====================
 */
export type IOptional<T> = {
  [P in keyof T]: T[P] | undefined
}

export type IOptionalSchemas<
  T extends any[],
  U extends any[] = [],
> = IOptional<T> extends T
  ? [...U, ...Partial<Required<T>>]
  : T extends [infer F, ...infer R]
  ? IOptionalSchemas<R, [...U, F]>
  : U

export type IHandlePartialTuples<T extends any> = T extends any[]
  ? IOptionalSchemas<T>
  : T
/**
 * ====================
 * End section from zod-utils/check
 * ====================
 */

// This came from https://github.com/garronej/tsafe/blob/main/src/tools/Unite.ts
export type Unite<T> = T extends { [key: string]: any }
  ? { [K in keyof T]: Unite<T[K]> }
  : T

export type CheckParameters<F extends IFunc> = F extends inferParameters<
  infer Z
>
  ? Parameters<F> extends IHandlePartialTuples<Z>
    ? 1
    : 'Parameters do not match schema'
  : 1

export type IUniteParams<T> = {
  [P in keyof T]: Unite<T[P]>
}

export type CheckJson<F extends IFunc> = IUniteParams<
  Parameters<F>
> extends Partial<JsonValue[]>
  ? 1
  : F extends inferParameters
  ? 1
  : 'Non Json Values used in params without schemas to parse them'

export type inferCtx<F extends IFunc> = Awaited<
  ReturnType<ThisParameterType<F>['useCtx']>
>

export type CheckThis<
  F extends IFunc,
  C extends any = undefined,
> = inferCtx<F> extends C
  ? 1
  : inferCtx<F> extends {
      [key: string]: any
    }
  ? C extends undefined
    ? 'Function with this param must be called with service.makeQuery/Command'
    : 'This parameter uses a different service'
  : 1

export type Check<
  F extends IFunc,
  T extends IRPCType,
  C extends any = any,
  R extends IRequestType = any,
> = CheckParameters<F> extends string
  ? CheckParameters<F>
  : CheckJson<F> extends string
  ? CheckJson<F>
  : CheckThis<F, C> extends string
  ? CheckThis<F, C>
  : IProcedure<F, T, C, R>

export function makeQuery<F extends IFunc>(fn: F) {
  return {
    fn,
    type: 'query',
  } as any as Check<F, 'query'>
}

export function makeCommand<F extends IFunc>(fn: F) {
  return {
    fn,
    type: 'command',
  } as any as Check<F, 'command'>
}
