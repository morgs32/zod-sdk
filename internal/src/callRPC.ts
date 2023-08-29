import { parseRes } from './parseRes'
import { makeRequest } from './makeRequest'
import { ICompleteRPC, IRequestOptions } from 'zod-sdk/server'

export async function callRPC(rpc: ICompleteRPC, options?: IRequestOptions) {
  const req = makeRequest(rpc, options)
  const res = await fetch(req)
  return parseRes(res)
}
