import { IncomingMessage } from 'http'
import { JsonValue } from 'type-fest'
import { ZodType } from 'zod'

export type Func<I extends any = any> =
  | ((input: I) => Promise<any>)
  | (() => Promise<any>)

export type RequestType = IncomingMessage | Request

export interface ISchemas<F extends Func> {
  parameter: ZodType<Parameters<F>[0]>
  payload: ZodType<Awaited<ReturnType<F>>>
}

export interface IContextFn<R extends RequestType = RequestType, C = any> {
  (req: R): C | Promise<C>
}

export type InferHandlerFn<H extends IHandler> = Awaited<
  H extends IHandler<infer T> ? T : never
>

export type IResult = {
  payload: any
  schema?: any
  included?: any[]
}

export type IMiddlewareReturnType = IResult | void | Response
export interface IMiddlewareFn<R = RequestType> {
  (
    req: R,
    next: () => Promise<IResult>
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

export interface IDispatcherHandler<
  F extends Func = Func,
  S extends ISchemas<F> | undefined = undefined,
> {
  procedure: F
  schemas: S
  type: IType
  dispatcher: true
}

/**
 * If you don't pass schemas to makeQuery or makeComment,
 * then your argument needs to be JSON compatible (no dates)
 */
export interface InvalidJsonOrMissingSchemas {}

export interface IRoutes {
  [key: string]: Func | IHandler | IRoutes
}

export type IRequestOptions = Omit<RequestInit, 'headers'> & {
  headers?: Record<string, string>
}

export type INextFunction = () => Promise<any>

export type IDispatcher<R extends IRoutes> = {
  [K in keyof R]: R[K] extends IHandler<infer F>
    ? IDispatcherHandler<F>
    : // : R[K] extends () => any
    // ? IDispatcherHandler<R[K]>
    R[K] extends Func<infer I>
    ? I extends unknown
      ? IDispatcherHandler<R[K]>
      : I extends JsonValue
      ? IDispatcherHandler<R[K]>
      : InvalidJsonOrMissingSchemas
    : R[K] extends IRoutes
    ? IDispatcher<R[K]>
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
