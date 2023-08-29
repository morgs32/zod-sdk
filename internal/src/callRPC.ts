import { parseRes } from './parseRes'
import { makeFetchArgs } from './makeFetchArgs'
import { ICompleteRPC, IRequestOptions } from 'zod-sdk/server'

export async function callRPC(rpc: ICompleteRPC, options?: IRequestOptions) {
  const res = await fetch(...makeFetchArgs(rpc, options))
  return parseRes(res)
}
