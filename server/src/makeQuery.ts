import { JsonValue } from 'type-fest'
import {
  Func,
  IHandler,
  InvalidJsonOrMissingSchemas,
  ISchemas,
} from 'zod-sdk/internal'

export function makeQuery<F extends Func, S extends ISchemas<F>>(
  procedure: F,
  schemas: S
): IHandler<F, S, 'query'>
export function makeQuery<F extends Func>(
  procedure: F
): F extends Func<infer I>
  ? I extends JsonValue
    ? IHandler<F, undefined, 'query'>
    : InvalidJsonOrMissingSchemas
  : never
export function makeQuery<F extends Func, S extends ISchemas<F>>(
  procedure: F,
  schemas?: S
) {
  return {
    procedure,
    schemas,
    type: 'query',
  }
}
