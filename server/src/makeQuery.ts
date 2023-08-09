import { Func, IHandler, ISchemas } from 'zod-sdk/internal'

export function makeQuery<F extends Func>(procedure: F): IHandler<F, undefined>
export function makeQuery<F extends Func, S extends ISchemas<F>>(
  procedure: F,
  schemas: S
): IHandler<F, S>
export function makeQuery<F extends Func>(procedure: F, schemas?: ISchemas<F>) {
  return {
    procedure,
    schemas,
    type: 'query',
  }
}
