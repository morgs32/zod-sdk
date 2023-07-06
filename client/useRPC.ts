import {
  IClientSDK,
  IClientSDKInternal,
  IRemoteProcedureCall,
} from '../types';
import { SWRConfiguration, SWRResponse } from 'swr';
import { createInnerProxy } from './createInnerProxy';
import { callRPC } from './callRPC';
import { isRPC } from './isRPC';
import { IRoutes } from '../types';

const componentType = typeof window === 'undefined' ? 'server' : 'client';

export function useRPC<R extends IRoutes, T>(sdk: IClientSDK<R>, options: {
  fn: (sdk: IClientSDK<R>) => T;
  onSuccess?: (data: Awaited<T>) => void;
} & Omit<SWRConfiguration, 'onSuccess'>): SWRResponse<Exclude<Awaited<T>, null | undefined | false | ''>> {

  const {
    fn,
    onSuccess,
    ...swrConfig
  } = options;

  const baseUrl = (sdk as IClientSDKInternal)._baseUrl() as string;
  const globalSwrConfig = (sdk as IClientSDKInternal)._swrConfig() as SWRConfiguration | undefined;

  /**
   * mockSDK has to look just like sdk,
   * but instead of calling query,
   * it returns the rpc.
   */
  const makeRPC = createInnerProxy((rpc) => rpc) as any as IClientSDK<R>;
  const maybeAnRPC = fn(makeRPC) as IRemoteProcedureCall | false | null | undefined;

  if (componentType === 'server') {
    throw new Error('useRPC can only be called in client components');
  }

  const useSWR = require('swr')

  return useSWR(
    isRPC(maybeAnRPC) && maybeAnRPC,
    async (rpc: IRemoteProcedureCall) => callRPC(baseUrl, rpc),
    {
      ...globalSwrConfig,
      ...swrConfig,
      onSuccess,
    }
  );
}
