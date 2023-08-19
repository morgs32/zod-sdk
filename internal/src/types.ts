import { IncomingMessage } from 'http'
import { JsonValue } from 'type-fest'
import { z } from 'zod'

export type Func<S extends any = any, I extends any = any> =
  | ((this: S, input: I) => Promise<any>)
  | (() => Promise<any>)

type RequestType = IncomingMessage | Request

export interface ISchemas<F extends Func = Func> {
  parameter: z.ZodType<Parameters<F>[0]>
  payload: z.ZodType<Awaited<ReturnType<F>>>
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

export type IRPCType = 'query' | 'command'

export interface IHandler<
  F extends Func = Func,
  S extends ISchemas<F> | undefined = ISchemas<F> | undefined,
  T extends IRPCType = IRPCType,
> {
  fn: F
  type: T
  makeContext?: IContextFn
  middleware?: IMiddlewareFn<any>
  schemas?: S
}

/**
 * If you don't pass schemas to makeQuery or makeComment,
 * then your argument needs to be JSON compatible (no dates)
 */
export interface InvalidJsonOrMissingSchemas {}

export interface IRoutes {
  [key: string]:
    | Func<undefined>
    | Func<JsonValue>
    | IHandler
    | IHandler<Func, ISchemas>
    | IRoutes
}

export type IRequestOptions = Omit<RequestInit, 'headers'> & {
  headers?: Record<string, string>
}

export interface IBaseRPC<I extends any = any> {
  path: string[]
  input: I
  baseUrl: string
}

export interface ICompleteRPC<I extends any = any> extends IBaseRPC<I> {
  type: IRPCType
}
