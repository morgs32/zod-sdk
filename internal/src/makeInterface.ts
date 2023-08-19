import {
  Func,
  IHandler,
  IRoutes,
  ISchemas,
  IRPCType,
  InvalidJsonOrMissingSchemas,
} from 'zod-sdk/internal'
import { makeInnerProxy } from './makeInnerProxy'
import { JsonValue } from 'type-fest'

export interface IInterfaceOptions {
  baseUrl: string
}

export interface IInterfaceHandler<
  F extends Func = Func,
  S extends ISchemas<F> | undefined = undefined,
  T extends IRPCType = IRPCType,
> {
  fn: F
  schemas: S
  type: T
  dispatcher: true
}

export type IInterface<R extends IRoutes> = {
  [K in keyof R]: R[K] extends IHandler<infer F, infer S, infer T>
    ? IInterfaceHandler<F, S, T>
    : R[K] extends Func<undefined>
    ? IInterfaceHandler<R[K], undefined, 'query'>
    : R[K] extends Func<infer P>
    ? P extends JsonValue
      ? IInterfaceHandler<R[K], undefined, 'query'>
      : InvalidJsonOrMissingSchemas
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
