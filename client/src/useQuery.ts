import {
  Func,
  IBaseRPC,
  IInstructionsHandler,
  IMaybeJsonified,
  callRPC,
  isRPC,
} from 'zod-sdk/internal'
import { SWRConfiguration, SWRResponse } from 'swr'
import useSWR from 'swr'
import { ISchemas } from 'internal/dist'

type IFalsy = null | undefined | false | ''

export function useQuery<
  F extends Func,
  S extends ISchemas<F> | undefined,
  R extends ReturnType<F>,
>(
  handler: IFalsy | IInstructionsHandler<F, S>,
  fetcher: (query: F) => R,
  options?: {
    onSuccess?: (data: Awaited<IMaybeJsonified<S, R>>) => void
  } & Omit<SWRConfiguration, 'onSuccess'>
): SWRResponse<Awaited<IMaybeJsonified<S, R>>> {
  const maybeAnRPC = fetcher(handler as any as F) as any as IBaseRPC | IFalsy

  return useSWR(
    isRPC(maybeAnRPC) && maybeAnRPC,
    async (rpc) =>
      callRPC({
        ...rpc,
        type: 'query',
      }),
    options
  )
}
