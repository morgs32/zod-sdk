import { JsonValue } from 'type-fest'
import { IFunc } from './types'
import { IProcedure, IRPCType } from 'server/dist'
import { ZodType } from 'zod'
import { IZod } from './makeSchemas'

/**
 * If you don't pass schemas to makeQuery or makeComment,
 * then your argument needs to be JSON compatible (no dates)
 */
export interface ValidJsonOrSchemasRequired {}
export interface MustMakeProcedureWithService {}

type CheckJson<F extends IFunc> = Parameters<F> extends JsonValue[]
  ? 1
  : F extends {
      parameters: (z: IZod) => ZodType<Parameters<F>>
    }
  ? 1
  : 'Non Json Values used in params without schemas to parse them'

type CheckThis<F extends IFunc> = Awaited<
  ReturnType<ThisParameterType<F>['useCtx']>
> extends {}
  ? 'Function with this param must be called with service.makeQuery/Command'
  : 1

type Check<F extends IFunc, T extends IRPCType> = CheckJson<F> extends string
  ? CheckJson<F>
  : CheckThis<F> extends string
  ? CheckThis<F>
  : IProcedure<F, undefined, T>

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
