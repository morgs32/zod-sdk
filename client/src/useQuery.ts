import {
  IFunc,
  IBaseRPC,
  IInterfaceProcedure,
  IMaybeJsonified,
  callRPC,
  isRPC,
} from 'zod-sdk/internal'
import { SWRConfiguration, SWRResponse } from 'swr'
import useSWR from 'swr'
import { ISchemas } from 'internal/dist'

type IFalsy = null | undefined | false | ''

export function useQuery<
  F extends IFunc,
  S extends ISchemas<F> | undefined,
  R extends ReturnType<F>,
  A extends any[],
  B extends A,
>(
  key: IFalsy | IInterfaceProcedure<F, S> | [IInterfaceProcedure<F, S>, ...A],
  fetcher: (query: F, ...args: B) => R,
  options?: {
    onSuccess?: (data: Awaited<IMaybeJsonified<S, R>>) => void
  } & Omit<SWRConfiguration, 'onSuccess'>
): SWRResponse<Awaited<IMaybeJsonified<S, R>>>
export function useQuery<
  F extends IFunc,
  S extends ISchemas<F> | undefined,
  R extends ReturnType<F>,
  A extends any[],
>(
  key: IFalsy | IInterfaceProcedure<F, S> | [IInterfaceProcedure<F, S>, ...A],
  fetcher: (query: F, ...args: A) => R,
  options?: {
    onSuccess?: (data: Awaited<IMaybeJsonified<S, R>>) => void
  } & Omit<SWRConfiguration, 'onSuccess'>
): SWRResponse<Awaited<IMaybeJsonified<S, R>>> {
  let procedure: IInterfaceProcedure<F, S> | undefined
  if (Array.isArray(key)) {
    procedure = key[0]
  } else if (key) {
    procedure = key
  }
  const rpc = fetcher(
    procedure as any as F,
    // @ts-ignore
    ...(Array.isArray(key) ? key.slice(1) : [])
  ) as any as IBaseRPC | IFalsy

  if (!isRPC(rpc)) {
    throw new Error('Invalid rpc')
  }

  return useSWR(
    rpc,
    async (rpc) =>
      callRPC({
        ...rpc,
        type: 'query',
      }),
    options
  )
}
