import { ZodType } from 'zod'
import { IncomingMessage } from 'http'

export type Func = (input: any) => Promise<any>

export type RequestType = IncomingMessage | Request

export interface IContextFn<R extends RequestType = RequestType, C = any> {
  (req: R): C | Promise<C>;
}

export type InferHandlerReturnType<H extends IHandler> = Awaited<H extends IHandler<infer T> ? ReturnType<T> : never>

export type IPayload = {
  result: any
  included?: any[]
}

export type IMiddlewareReturnType = IPayload | void | Response
export interface IMiddlewareFn<R = RequestType> {
  (req: R, next: () => Promise<IPayload>): IMiddlewareReturnType | Promise<IMiddlewareReturnType>;
}

type IType = 'query' | 'command'

export interface IHandler<F extends Func = Func> {
  procedure: F
  makeContext?: IContextFn<any>
  middleware?: IMiddlewareFn<any>
  schema?: ZodType<any>
  type: IType
}

export interface IRoutes {
  [key: string]: IHandler | IRoutes | ((...args: any[]) => any);
}

export type IRequestOptions = Omit<RequestInit, 'headers'> & {
  headers?: Record<string, string>
}

export type INextFunction = () => Promise<any>

export type IClientSDK<R extends IRoutes> = {
  [K in keyof R]: R[K] extends IHandler
    ? R[K]
    : R[K] extends (...args: any[]) => any
      ? IHandler<R[K]>
      : R[K] extends IRoutes 
        ? IClientSDK<R[K]> 
        : never;
}

export interface IBaseRPC<I extends any = any> {
  path: string[];
  input: I;
  baseUrl: string;
}

export interface ICompleteRPC<I extends any = any> extends IBaseRPC<I> {
  type: IType
}
