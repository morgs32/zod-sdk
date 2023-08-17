import { IInstructions, IRoutes } from 'zod-sdk/internal'
import { makeInnerProxy } from './makeInnerProxy'

export interface IInstructionsOptions {
  baseUrl: string
}

export function makeInstructions<R extends IRoutes>(
  props: IInstructionsOptions
): IInstructions<R> {
  const { baseUrl } = props

  const sdk = makeInnerProxy({
    baseUrl,
  }) as any as IInstructions<R>

  return sdk
}
