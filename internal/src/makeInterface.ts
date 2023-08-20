import { makeInnerProxy } from './makeInnerProxy'
import { IFunc, IProcedure, IRPCType, IRoutes, ISchemas } from 'zod-sdk/server'

export interface IInterfaceOptions {
  baseUrl: string
}

export interface IInterfaceProcedure<
  F extends IFunc = IFunc,
  S extends ISchemas<F> | undefined = undefined,
  T extends IRPCType = IRPCType,
  C extends any = undefined,
> {
  fn: F
  schemas: S
  type: T
  useCtx: () => C
  dispatcher: true
}

export type IInterface<R extends IRoutes> = {
  [K in keyof R]: R[K] extends IProcedure<infer F, infer S, infer T, infer C>
    ? IInterfaceProcedure<F, S, T, C>
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
