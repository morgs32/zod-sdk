import { JsonValue } from 'type-fest'
import {
  Func,
  IHandler,
  InvalidJsonOrMissingSchemas,
  ISchemas,
  IType,
} from 'zod-sdk/internal'

export function makeProcedure<
  T extends IType,
  F extends Func,
  S extends ISchemas<F>,
>(type: T, procedure: F, schemas: S): IHandler<F, S, T>
export function makeProcedure<T extends IType, F extends Func>(
  type: T,
  procedure: F
): F extends Func<infer I>
  ? I extends JsonValue
    ? IHandler<F, undefined, T>
    : InvalidJsonOrMissingSchemas
  : never
export function makeProcedure<
  T extends IType,
  F extends Func,
  S extends ISchemas<F>,
>(type: T, procedure: F, schemas?: S) {
  return {
    procedure,
    schemas,
    type,
  }
}
