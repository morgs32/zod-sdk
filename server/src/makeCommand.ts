import { Func, IHandler, ISchemas } from 'zod-sdk/internal'

export function makeCommand<F extends Func>(
  procedure: F,
  schemas?: ISchemas<F>
): IHandler<F> {
  return {
    procedure,
    schemas,
    type: 'command',
  }
}
