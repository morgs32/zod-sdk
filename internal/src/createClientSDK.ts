import {
  IClientSDK,
  IRoutes,
} from 'okrpc/internal';
import { createInnerProxy } from './createInnerProxy';
import { callRPC } from './callRPC';
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

  const sdk = createInnerProxy((rpc) => {
    // To be used in useSWR
    if (rpc.path.includes('_baseUrl')) return baseUrl 
    if (rpc.path.includes('_swrConfig')) return swrConfig 
    // --------------------------------------

    return callRPC(baseUrl, rpc)
  }) as any as IClientSDK<R>
  
  return sdk
}
