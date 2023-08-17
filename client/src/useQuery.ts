import {
  IBaseRPC,
  IInstructionsHandler,
  IMaybeJsonified,
  callRPC,
  isRPC,
} from 'zod-sdk/internal'
import { SWRConfiguration, SWRResponse } from 'swr'
import useSWR from 'swr'

type IFalsy = null | undefined | false | ''

export function useQuery<
  D extends IInstructionsHandler,
  F extends D extends IInstructionsHandler<infer _F> ? _F : never,
  S extends D extends IInstructionsHandler<any, infer _S> ? _S : never,
  R extends ReturnType<F>,
  T extends R | IFalsy,
>(
  handler: D,
  options: {
    fn: (query: F) => T
    onSuccess?: (
      data: Awaited<T extends R ? IMaybeJsonified<S, T> : never>
    ) => void
  } & Omit<SWRConfiguration, 'onSuccess'>
): SWRResponse<Awaited<T extends R ? IMaybeJsonified<S, T> : never>> {
  const { fn, onSuccess, ...swrConfig } = options

  const maybeAnRPC = fn(handler as any as F) as any as IBaseRPC | IFalsy

  return useSWR(
    isRPC(maybeAnRPC) && maybeAnRPC,
    async (rpc) =>
      callRPC({
        ...rpc,
        type: 'query',
      }),
    {
      ...swrConfig,
      onSuccess,
    }
  )
}
