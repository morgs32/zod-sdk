import { IncomingMessage } from 'http';
import {
  Func,
  IContextFn,
  IHandler,
  IMiddlewareFn 
} from 'zod-sdk/internal';
import { asyncLocalStorage } from './asyncLocalStorage';
import { ZodType } from 'zod';

export function createProcedure<R extends IncomingMessage | Request, C extends {} | Promise<{}>>(options: {
  middleware?: IMiddlewareFn<R>
  createContext?: IContextFn<R, C>
} = {}) {

  const {
    middleware,
    createContext,
  } = options

  return {
    makeQuery: function makeHandler<F extends Func>(procedure: F, schema?: ZodType<any>): IHandler<F> {
      return {
        procedure,
        middleware,
        createContext,
        schema,
        type: 'query'
      };
    },
    makeCommand: function makeHandler<F extends Func>(procedure: F, schema?: ZodType<any>): IHandler<F> {
      return {
        procedure,
        middleware,
        createContext,
        schema,
        type: 'command'
      };
    },
    useCtx: function useCtx() {
      return asyncLocalStorage.getStore() as C
    },
    mockCtx: function mockCtx<T extends any>(ctx: C, fn: () => Promise<T>): Promise<T> {
      return asyncLocalStorage.run(ctx, fn)
    }
  }

}
