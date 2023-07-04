import { ZodType } from 'zod'
import { IncomingMessage } from 'http'

export type Func = (input: any) => Promise<any>


export type RequestType = IncomingMessage | Request

export interface IContextFn<T = any, R extends RequestType = RequestType> {
  (req: R): T | Promise<T>;
}


export interface IContextFn<T = any, R extends RequestType = RequestType> {
  (req: R): T | Promise<T>;
}

export interface IMiddlewareFn<R = RequestType, T = any> {
  (
    req: R, 
    next: () => Promise<any>,
  ): Promise<T | Response>
}

export interface IHandler<F extends Func = Func> {
  procedure: F
  createContext?: IContextFn<any>
  middleware?: IMiddlewareFn<any>
  schema?: ZodType<any>
}

export interface IRoutes {
  [key: string]: IHandler | IRoutes | ((...args: any[]) => any);
}