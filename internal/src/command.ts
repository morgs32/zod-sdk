import { 
  IBaseRPC,
  IHandler, 
  callRPC 
} from '.';

export function command<H extends IHandler, F extends H extends IHandler<infer T> ? T : never, R extends ReturnType<F>>(handler: H, fn: (query: F) => R): R {
  const rpc = fn(handler as any as F) as any as IBaseRPC
  return callRPC({
    ...rpc,
    type: 'command'
  }) as R
}