import { ZodType } from 'zod'
import { IncomingMessage } from 'http'
import { SWRConfiguration } from 'swr'

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

type IType = 'query' | 'command'

export interface IHandler<F extends Func = Func> {
  procedure: F
  createContext?: IContextFn<any>
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

export type IClientSDKInternal = IClientSDK<any> & {
  _baseUrl: () => string;
  _swrConfig: () => SWRConfiguration | undefined;
}

export type IHandlerInternal = IHandler & {
  _baseUrl: () => string;
  _swrConfig: () => SWRConfiguration | undefined;
}

export interface IBaseRPC<I extends any = any> {
  path: string[];
  input: I;
  baseUrl: string;
  swrConfig?: SWRConfiguration;
}

export interface ICompleteRPC<I extends any = any> extends IBaseRPC<I> {
  type: IType
}
