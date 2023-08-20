import { parseRes } from './parseRes'
import { makeFetchArgs } from './makeFetchArgs'
import { ICompleteRPC, IRequestOptions } from 'zod-sdk/server'

export async function callRPC(rpc: ICompleteRPC, options?: IRequestOptions) {
  const [url, requestInit] = makeFetchArgs(rpc, options)
  const res = await fetch(url, requestInit)
  return parseRes(res)
}
