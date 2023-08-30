import { makeInnerProxy } from './makeInnerProxy'
import { IFunc, IProcedure, IRPCType, IRoutes } from 'zod-sdk/server'

export interface IInterfaceOptions {
  baseUrl: string
}

export interface IInterfaceProcedure<
  F extends IFunc = IFunc,
  T extends IRPCType = IRPCType, // Need this for call() so we know to use procedure.query or procedure.command
  C extends any = any, // Need this for call() so we can type this on the query/command fn()
> {
  fn: F
  type: T
  useCtx: () => C
  dispatcher: true
}

export type IInterface<R extends IRoutes> = {
  [K in keyof R]: R[K] extends IProcedure<infer F, infer T, infer C>
    ? IInterfaceProcedure<F, T, C>
    : R[K] extends IRoutes
    ? IInterface<R[K]>
    : never
}

export function makeInterface<R extends IRoutes>(
  props: IInterfaceOptions
): IInterface<R> {
  const { baseUrl } = props

  const sdk = makeInnerProxy({
    baseUrl,
  }) as any as IInterface<R>

  return sdk
}
