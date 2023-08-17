import { JsonValue } from 'type-fest'
import {
  Func,
  IHandler,
  InvalidJsonOrMissingSchemas,
  ISchemas,
} from 'zod-sdk/internal'

export function makeCommand<F extends Func, S extends ISchemas<F>>(
  procedure: F,
  schemas: S
): IHandler<F, S, 'command'>
export function makeCommand<F extends Func>(
  procedure: F
): F extends Func<infer I>
  ? I extends JsonValue
    ? IHandler<F>
    : InvalidJsonOrMissingSchemas
  : never
export function makeCommand<F extends Func, S extends ISchemas<F>>(
  procedure: F,
  schemas?: S
) {
  return {
    procedure,
    schemas,
    type: 'command',
  }
}
