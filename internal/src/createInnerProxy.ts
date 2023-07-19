import { IRemoteProcedureCall } from 'zod-sdk/internal';

const noop = () => {}

export function createInnerProxy(callback: (rpc: IRemoteProcedureCall) => unknown, path: string[] = []) {
  const proxy: unknown = new Proxy(noop, {
    get(_obj, key) {
      if (typeof key !== 'string' || key === 'then') {
        return undefined; // Special case for if the proxy is accidentally treate like a PromiseLike (like in `Promise.resolve(proxy)`)
      }
      return createInnerProxy(callback, [...path, key]);
    },
    apply(_1, _2, [input]) {
      return callback({
        input,
        path,
      });
    },
  });

  return proxy;
}
