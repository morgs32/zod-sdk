import { IContextFn } from 'internal/dist'
import { JsonValue } from 'type-fest'
import {
  Func,
  IHandler,
  InvalidJsonOrMissingSchemas,
  ISchemas,
  IRPCType,
} from 'zod-sdk/internal'

type IParameterInterfaceFix<T> = T extends {}
  ? {
      [P in keyof T]: T[P]
    }
  : T

export function makeProcedure<F extends Func, T extends IRPCType = 'query'>(
  fn: F
): F extends Func<undefined>
  ? IHandler<F, undefined, T>
  : F extends Func<infer P>
  ? IParameterInterfaceFix<P> extends JsonValue
    ? IHandler<F, undefined, T>
    : InvalidJsonOrMissingSchemas
  : never
export function makeProcedure<
  F extends Func,
  S extends ISchemas<F>,
  M extends IContextFn,
  T extends IRPCType = 'query',
>(
  fn: F,
  options: {
    type?: T
    schemas?: S
    makeContext?: M
    middleware?: any // TODO: fix
  }
): IHandler<F, S, T>
export function makeProcedure<
  T extends IRPCType,
  F extends Func,
  S extends ISchemas<F>,
  M extends IContextFn,
>(
  fn: F,
  options?: {
    type?: T
    schemas?: S
    makeContext?: M
    middleware?: any // TODO: fix
  }
): IHandler {
  return {
    fn,
    type: 'query',
    ...options,
  }
}
