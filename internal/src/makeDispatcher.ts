import { IDispatcher, IRoutes } from 'zod-sdk/internal'
import { makeInnerProxy } from './makeInnerProxy'

export interface IDispatcherOptions {
  baseUrl: string
}

export function makeDispatcher<R extends IRoutes>(
  props: IDispatcherOptions
): IDispatcher<R> {
  const { baseUrl } = props

  const sdk = makeInnerProxy({
    baseUrl,
  }) as any as IDispatcher<R>

  return sdk
}
