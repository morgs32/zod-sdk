import { IncomingMessage } from 'http';
import {
  Func,
  IContextFn,
  IHandler,
  IMiddlewareFn 
} from 'zod-sdk/internal';
import { asyncLocalStorage } from './asyncLocalStorage';
import { ZodType } from 'zod';

interface IHandlerOptions {
  schema: ZodType<any>
}

export function createProcedure<C extends {}, R extends IncomingMessage | Request>(options: {
  middleware?: IMiddlewareFn<R>
  createContext?: IContextFn<C, R>
} = {}) {

  const {
    middleware,
    createContext,
  } = options

  return {
    makeHandler: function makeHandler<F extends Func>(procedure: F, handlerOptions: IHandlerOptions): IHandler<F> {
      return {
        procedure,
        middleware,
        createContext: createContext as IContextFn<C>,
        schema: handlerOptions.schema,
      };
    },
    useCtx: function useCtx(): C {
      return asyncLocalStorage.getStore()
    },
    mockCtx: function mockCtx<T extends any>(fn: () => Promise<T>, ctx: C): Promise<T> {
      return asyncLocalStorage.run(ctx, fn)
    }
  }

}
