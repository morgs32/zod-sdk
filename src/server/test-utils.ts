import { createClientSDK } from '../client/createClientSDK';
import { fetchAdapter } from '../client/fetchAdapter';
import { IRouter } from './createServerRouter';
import { IClientSDK, IRequestOptions } from '../types';

export async function callRouter<R extends IRouter, T>(router: R, options: IRequestOptions & {
  fn: (sdk: IClientSDK<R['routes']>) => T
}) {
  
  const sdk = createClientSDK({
    baseUrl: 'http://localhost:3000',
  });

  const {
    fetchArgs,
    parseRes,
  } = fetchAdapter(sdk, options)

  const req = new Request(...fetchArgs)
  const res = await router(req)
  return parseRes(res)
}