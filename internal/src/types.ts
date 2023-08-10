import { IncomingMessage } from 'http'
import { ZodType } from 'zod'

export type Func = (input: any) => Promise<any>

export type RequestType = IncomingMessage | Request

export interface ISchemas<F extends Func> {
  parameter: ZodType<Parameters<F>[0]>
  result: ZodType<Awaited<ReturnType<F>>>
}

export interface IContextFn<R extends RequestType = RequestType, C = any> {
  (req: R): C | Promise<C>
}

export type InferHandlerFn<H extends IHandler> = Awaited<
  H extends IHandler<infer T> ? T : never
>

export type IPayload = {
  result: any
  included?: any[]
}

export type IMiddlewareReturnType = IPayload | void | Response
export interface IMiddlewareFn<R = RequestType> {
  (
    req: R,
    next: () => Promise<IPayload>
  ): IMiddlewareReturnType | Promise<IMiddlewareReturnType>
}

type IType = 'query' | 'command'

export interface IHandler<
  F extends Func = Func,
  S extends ISchemas<F> | undefined = any,
> {
  procedure: F
  makeContext?: IContextFn<any>
  middleware?: IMiddlewareFn<any>
  schemas: S
  type: IType
}

export interface IRoutes {
  [key: string]: IHandler | IRoutes | ((...args: any[]) => any)
}

export type IRequestOptions = Omit<RequestInit, 'headers'> & {
  headers?: Record<string, string>
}

export type INextFunction = () => Promise<any>

export interface IClientHandler<H extends IHandler = IHandler> {
  procedure: H['procedure']
  schemas: H['schemas']
  client: true
}

export type IClientSDK<R extends IRoutes> = {
  [K in keyof R]: R[K] extends IHandler
    ? IClientHandler<R[K]>
    : R[K] extends (...args: any[]) => any
    ? IHandler<R[K]>
    : R[K] extends IRoutes
    ? IClientSDK<R[K]>
    : never
}

export interface IBaseRPC<I extends any = any> {
  path: string[]
  input: I
  baseUrl: string
}

export interface ICompleteRPC<I extends any = any> extends IBaseRPC<I> {
  type: IType
}
