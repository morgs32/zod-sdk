import { IRemoteProcedureCall } from '../types';
import { makeFetchArgs } from './makeFetchArgs';
import SuperJSON from 'superjson';

export async function callRPC(baseUrl: string, rpc: IRemoteProcedureCall) {

  const [url, requestOptions] = makeFetchArgs({
    baseUrl, 
    rpc
  })
  const res = await fetch(url, requestOptions)
  return parseRes(res)
  
}

export async function parseRes(res: Response) {
  if (!res.ok) {
    const message = await res.text().catch(e => e.message)
    const url = new URL(res.url)
    if (res.status === 404) {
      throw new Error(`Check that there is an sdk route at ${url.origin + url.pathname.split('/').slice(0, -1).join('/')} \n${message}`)
    }
    throw new Error(`[${res.status}] at ${url.href} \n${message}`)
  }
  const {
    result,
    included // TODO: handle included
  } = SuperJSON.deserialize(await res.json()) as any
  return result
}