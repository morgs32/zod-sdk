import { JsonValue } from 'type-fest'
import { IInterfaceProcedure } from '.'

export type IOnlyFunc<A extends JsonValue[] = JsonValue[]> = (
  ...args: A
) => Promise<any>

export type inferFn<H extends IInterfaceProcedure> =
  H extends IInterfaceProcedure<infer F> ? F : never

export type inferReturn<H extends IInterfaceProcedure> = Awaited<
  ReturnType<inferFn<H>>
>
