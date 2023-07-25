import { ICompleteRPC } from './types';
import { makeFetchArgs } from './makeFetchArgs';
import { parseRes } from './parseRes';

export async function callRPC(rpc: ICompleteRPC) {
  const [url, requestOptions] = makeFetchArgs(rpc)
  const res = await fetch(url, requestOptions)
  return parseRes(res)
}

