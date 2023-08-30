import {
  IInterfaceProcedure,
  IMaybeJsonified,
  callRPC,
  isRPC,
} from 'zod-sdk/internal'
import { SWRConfiguration, SWRResponse } from 'swr'
import useSWR from 'swr'
import { IBaseRPC, IFunc } from 'zod-sdk/server'

type IFalsy = null | undefined | false | ''

export function useQuery<
  F extends IFunc,
  C extends any,
  R extends ReturnType<F>,
  A extends any[],
>(
  key:
    | IFalsy
    | IInterfaceProcedure<F, 'query', C>
    | [IInterfaceProcedure<F, 'query', C>, ...A],
  fetcher: (bag: { query: F; useCtx: () => C }, ...args: A) => R,
  options?: {
    onSuccess?: (data: IMaybeJsonified<F, Awaited<R>>) => void
  } & Omit<SWRConfiguration, 'onSuccess'>
): SWRResponse<IMaybeJsonified<F, Awaited<R>>> {
  let procedure: IInterfaceProcedure<F, 'query', C> | undefined
  if (Array.isArray(key)) {
    procedure = key[0]
  } else if (key) {
    procedure = key
  }

  const rpc = fetcher(
    {
      query: procedure as any as F,
      useCtx: (): any => {
        console.error(
          'Hmm, you should not be calling useCtx from the useQuery() method'
        )
        return
      },
    },
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
