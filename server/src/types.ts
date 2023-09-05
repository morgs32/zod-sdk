import { IncomingMessage } from 'http'
import z, { ZodTypeAny } from 'zod'

export type IResult = {
  payload: any
  schema?: any
  included?: any[]
}

export type IRequestType = IncomingMessage | Request

export type IMiddlewareReturnType = IResult | void | Response

export interface IMiddlewareFn<R = IRequestType> {
  (req: R, next: () => Promise<any>): Promise<any> | any
}

export interface IParameters<F extends IFunc = IFunc> {
  parameters: z.ZodType<Parameters<F>>
  payload: z.ZodType<Awaited<ReturnType<F>>>
}

export interface IContextFn<R extends IRequestType = IRequestType, C = any> {
  (req: R): C | Promise<C>
}

export type IFunc<C extends any = any, A extends any[] = any[]> = {
  (this: { useCtx: () => Awaited<C> }, ...args: A): Promise<any>
  parameters?: ZodTypeAny
  payload?: ZodTypeAny
}

export interface ISchemas<A, R> {
  parameters: z.ZodType<A>
  payload?: z.ZodType<R>
}

export type ISchemasFromF<F extends IFunc> = ISchemas<
  Parameters<F>,
  Awaited<ReturnType<F>>
>

export type IRPCType = 'query' | 'command'

export interface IProcedure<
  F extends IFunc = IFunc,
  T extends IRPCType = IRPCType,
  C extends any = any,
  R extends IRequestType = any,
> {
  fn: F
  type: T
  makeContext?: IContextFn<R, C>
  middleware?: IMiddlewareFn<any>
}

export interface IRoutes {
  [key: string]: IProcedure | IRoutes
}

export interface IBaseRPC<I extends any[] = any[]> {
  path: string[]
  input: I
  baseUrl: string
}

export interface ICompleteRPC<I extends any[] = any[]> extends IBaseRPC<I> {
  type: IRPCType
}

export type IRequestOptions = Omit<RequestInit, 'headers'> & {
  headers?: Record<string, string>
}
