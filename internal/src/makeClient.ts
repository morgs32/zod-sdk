import { IClientSDK, IRoutes } from 'zod-sdk/internal'
import { makeInnerProxy } from './makeInnerProxy'

export interface IClientOptions {
  baseUrl: string
}

export function makeClient<R extends IRoutes>(
  props: IClientOptions
): IClientSDK<R> {
  const { baseUrl } = props

  const sdk = makeInnerProxy({
    baseUrl,
  }) as any as IClientSDK<R>

  return sdk
}
