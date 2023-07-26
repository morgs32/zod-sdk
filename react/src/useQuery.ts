import {
  IBaseRPC,
  IHandler,
} from 'zod-sdk/internal';
import { Jsonify } from 'type-fest'
import {
  SWRConfiguration,
  SWRResponse
} from 'swr';
import {
  callRPC,
  isRPC 
} from 'zod-sdk/internal';
import useSWR from 'swr';

type IFalsy = null | undefined | false | '';

export function useQuery<H extends IHandler, F extends H extends IHandler<infer X> ? X : never, R extends ReturnType<F>, T extends R | IFalsy>(handler: H, options: {
  fn: (query: F) => T;
  onSuccess?: (data: Awaited<T extends R 
    ? 'schema' extends keyof H
      ? T 
      : Jsonify<T> 
    : never
  >
  ) => void;
} & Omit<SWRConfiguration, 'onSuccess'>): SWRResponse<
  Awaited<T extends R 
    ? 'schema' extends keyof H
      ? T 
      : Jsonify<T> 
    : never
  >
  > {

  const {
    fn,
    onSuccess,
    ...swrConfig
  } = options;

  const maybeAnRPC = fn(handler as any as F) as any as IBaseRPC | IFalsy

  return useSWR(
    isRPC(maybeAnRPC) && maybeAnRPC,
    async (rpc) => callRPC({
      ...rpc,
      type: 'query'
    }),
    {
      ...swrConfig,
      onSuccess,
    }
  );
}
