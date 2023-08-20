import { IncomingMessage } from 'http'
import z from 'zod'

export type IResult = {
  payload: any
  schema?: any
  included?: any[]
}

export type IRequestType = IncomingMessage | Request

export type IMiddlewareReturnType = IResult | void | Response

export interface IMiddlewareFn<R = IRequestType> {
  (
    req: R,
    next: () => Promise<IResult>
  ): IMiddlewareReturnType | Promise<IMiddlewareReturnType>
}

export interface IContextFn<R extends IRequestType = IRequestType, C = any> {
  (req: R): C | Promise<C>
}

export type IFunc<A extends any[] = any[]> = (...args: A) => Promise<any>

export interface ISchemas<F extends IFunc = IFunc> {
  parameters: z.ZodType<Parameters<F>>
  payload: z.ZodType<Awaited<ReturnType<F>>>
}

export type IRPCType = 'query' | 'command'

export interface IProcedure<
  F extends IFunc = IFunc,
  S extends ISchemas<F> | undefined = ISchemas<F> | undefined,
  T extends IRPCType = IRPCType,
> {
  fn: F
  type: T
  makeContext?: IContextFn
  middleware?: IMiddlewareFn<any>
  schemas?: S
}

export interface IRoutes {
  [key: string]: IFunc | IProcedure | IRoutes
}

export interface IBaseRPC<I extends any = any> {
  path: string[]
  input: I
  baseUrl: string
}

export interface ICompleteRPC<I extends any = any> extends IBaseRPC<I> {
  type: IRPCType
}

export type IRequestOptions = Omit<RequestInit, 'headers'> & {
  headers?: Record<string, string>
}
