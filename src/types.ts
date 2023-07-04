import { ZodType } from 'zod'
import { IncomingMessage } from 'http'
import { SWRConfiguration } from 'swr'

export type RequestType = IncomingMessage | Request

export type Func = (input: any) => Promise<any>

export type IRequestOptions = Omit<RequestInit, 'headers'> & {
  headers?: Record<string, string>
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

export interface IContextFn<T = any, R extends RequestType = RequestType> {
  (req: R): T | Promise<T>;
}

export type INextFunction = () => Promise<any>

export interface IMiddlewareFn<R = RequestType, T = any> {
  (
    req: R, 
    next: () => Promise<any>,
  ): Promise<T | Response>
}

export type IClientSDK<R extends IRoutes> = {
  [K in keyof R]: R[K] extends IHandler<infer F> 
    ? F 
    : R[K] extends (...args: any[]) => any
      ? R[K]
      : R[K] extends IRoutes 
        ? IClientSDK<R[K]> 
        : never;
}

export type IClientSDKInternal = IClientSDK<any> & {
  _baseUrl: () => string;
  _swrConfig: () => SWRConfiguration | undefined;
}

export interface IRemoteProcedureCall {
  path: string[];
  input: unknown[];
}
