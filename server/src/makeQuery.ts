import { Func, IHandler, ISchemas } from 'zod-sdk/internal'

export function makeQuery<F extends Func>(
  procedure: F,
  schemas?: ISchemas<F>
): IHandler<F> {
  return {
    procedure,
    schemas,
    type: 'query',
  }
}
