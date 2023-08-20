import { JsonValue } from 'type-fest'
import { IInterfaceProcedure } from '.'

export type IOnlyFunc<A extends JsonValue[] = JsonValue[]> = (
  ...args: A
) => Promise<any>

export type InferProcedureFn<H extends IInterfaceProcedure> = Awaited<
  H extends IInterfaceProcedure<infer T> ? T : never
>
