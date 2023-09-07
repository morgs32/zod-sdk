import { parseRes } from './parseRes'
import { makeFetchArgs } from './makeFetchArgs'
import { ICompleteRPC, IRequestOptions } from 'zod-sdk/server'
import { stableHash } from './hash'

export async function callRPC(rpc: ICompleteRPC, options?: IRequestOptions) {
  return memoize(rpc, async () => {
    const res = await fetch(...makeFetchArgs(rpc, options))
    return parseRes(res)
  })
}

const MEMOIZER: Record<string, any> = {}

function memoize(rpc: ICompleteRPC, fetcher: () => Promise<any>) {
  const key = stableHash(rpc)
  if (MEMOIZER[key]) return MEMOIZER[key]
  const promise = fetcher() as ReturnType<typeof fetcher>
  MEMOIZER[key] = promise
  const clone = promise.then()
  clone.catch(() => 1).finally(() => delete MEMOIZER[key])
  return promise
}
