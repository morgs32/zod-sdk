import { ZodType } from 'zod'
import { Func, IHandler } from 'zod-sdk/internal';

export function createQuery<F extends Func>(procedure: F, schema?: ZodType<Parameters<F>[0]>): IHandler<F> {
  return {
    procedure,
    schema,
    type: 'query'
  };
}

export function createCommand<F extends Func>(procedure: F, schema?: ZodType<Parameters<F>[0]>): IHandler<F> {
  return {
    procedure,
    schema,
    type: 'command'
  };
}