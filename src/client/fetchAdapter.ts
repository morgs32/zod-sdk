import {
  IClientSDK, IClientSDKInternal, IRemoteProcedureCall, IRequestOptions, IRoutes 
} from '../types';
import { createInnerProxy } from './createInnerProxy';
import { isRPC } from './isRPC';
import { parseRes } from './callRPC';
import { makeFetchArgs } from './makeFetchArgs';

export function fetchAdapter<R extends IRoutes, T>(sdk: IClientSDK<R>, options: IRequestOptions & {
  fn: (sdk: IClientSDK<R>) => T;
}): {
  fetchArgs: [string, IRequestOptions]
  parseRes: (res: Response) => Promise<Awaited<T>>
  rpc: IRemoteProcedureCall
} {

  const {
    fn,
    ...requestOptions
  } = options;
  
  const baseUrl = (sdk as IClientSDKInternal)._baseUrl() as string
  
  /**
   * calling rpcSDK just returns an rpc spec object.
   */
  const rpcSDK = createInnerProxy((rpc) => rpc) as any as IClientSDK<R>;
  const rpc = fn(rpcSDK) as IRemoteProcedureCall

  if (!isRPC(rpc)) {
    throw new Error('You must call an sdk function. Conditional calls are not supported in fetchAdapter.')
  }

  return {
    fetchArgs: [...makeFetchArgs({
      baseUrl,
      rpc,
      requestOptions
    })],
    parseRes,
    rpc,
  }
}
