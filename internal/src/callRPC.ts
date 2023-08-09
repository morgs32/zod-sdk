import { ICompleteRPC, IRequestOptions } from 'zod-sdk/internal'
import { parseRes } from './parseRes'
import { makeFetchArgs } from './makeFetchArgs'

export async function callRPC(rpc: ICompleteRPC, options?: IRequestOptions) {
  const [url, requestInit] = makeFetchArgs(rpc, options)
  const res = await fetch(url, requestInit)
  return parseRes(res)
}
