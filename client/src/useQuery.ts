import { IBaseRPC, IDispatcherHandler, callRPC, isRPC } from 'zod-sdk/internal'
import { Jsonify } from 'type-fest'
import { SWRConfiguration, SWRResponse } from 'swr'
import useSWR from 'swr'

type IFalsy = null | undefined | false | ''

export function useQuery<
  D extends IDispatcherHandler,
  F extends D extends IDispatcherHandler<infer H> ? H : never,
  R extends ReturnType<F>,
  T extends R | IFalsy,
>(
  handler: D,
  options: {
    fn: (query: F) => T
    onSuccess?: (
      data: Awaited<
        T extends R
          ? 'schema' extends keyof D
            ? T
            : Jsonify<Awaited<T>>
          : never
      >
    ) => void
  } & Omit<SWRConfiguration, 'onSuccess'>
): SWRResponse<
  Awaited<
    T extends R ? ('schema' extends keyof D ? T : Jsonify<Awaited<T>>) : never
  >
> {
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
