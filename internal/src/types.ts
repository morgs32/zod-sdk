import { IncomingMessage } from 'http'
import { JsonValue, Jsonify } from 'type-fest'
import { ZodType } from 'zod'

export type Func<I extends any = any> =
  | ((input: I) => Promise<any>)
  | (() => Promise<any>)

type RequestType = IncomingMessage | Request

export interface ISchemas<F extends Func = Func> {
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

export type IType = 'query' | 'command'

export interface IHandler<
  F extends Func = Func,
  S extends ISchemas<F> | undefined = ISchemas<F> | undefined,
  T extends IType = IType,
> {
  procedure: F
  makeContext?: IContextFn<any>
  middleware?: IMiddlewareFn<any>
  schemas: S
  type: T
}

export type IMaybeJsonified<
  S extends ISchemas | undefined,
  R extends any,
> = S extends undefined ? Promise<Jsonify<Awaited<R>>> : R

export interface IInstructionsHandler<
  F extends Func = Func,
  S extends ISchemas<F> | undefined = undefined,
  T extends IType = IType,
> {
  procedure: F
  schemas: S
  type: T
  dispatcher: true
}

/**
 * If you don't pass schemas to makeQuery or makeComment,
 * then your argument needs to be JSON compatible (no dates)
 */
export interface InvalidJsonOrMissingSchemas {}

export interface IRoutes {
  [key: string]: Func | IHandler | IHandler<Func, ISchemas> | IRoutes
}

export type IRequestOptions = Omit<RequestInit, 'headers'> & {
  headers?: Record<string, string>
}

export type INextFunction = () => Promise<any>

export type IInstructions<R extends IRoutes> = {
  [K in keyof R]: R[K] extends IHandler<infer F, infer S, infer T>
    ? IInstructionsHandler<F, S, T>
    : R[K] extends Func<infer I>
    ? I extends unknown
      ? IInstructionsHandler<R[K]>
      : I extends JsonValue
      ? IInstructionsHandler<R[K]>
      : InvalidJsonOrMissingSchemas
    : R[K] extends IRoutes
    ? IInstructions<R[K]>
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
