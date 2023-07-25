import {
  IClientSDK,
  IRoutes,
} from 'zod-sdk/internal';
import { createInnerProxy } from './createInnerProxy';
import { SWRConfiguration } from 'swr';

interface IProps {
  baseUrl: string
  swrConfig?: SWRConfiguration
}

export function createClientSDK<R extends IRoutes>(props: IProps): IClientSDK<R> {

  const {
    baseUrl,
    swrConfig,
  } = props

  const sdk = createInnerProxy({
    baseUrl,
    swrConfig
  }) as any as IClientSDK<R>
  
  return sdk
}
