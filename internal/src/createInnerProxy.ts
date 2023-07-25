import { SWRConfiguration } from 'swr';
import { IBaseRPC } from '.';

const noop = () => {}

interface IProps {
  path?: string[]
  baseUrl: string
  swrConfig?: SWRConfiguration
}

export function createInnerProxy(props: IProps) {

  const {
    path = [],
  } = props

  const proxy: unknown = new Proxy(noop, {
    get(_obj, key) {
      if (typeof key !== 'string' || key === 'then') {
        return undefined; // Special case for if the proxy is accidentally treated like a PromiseLike (like in `Promise.resolve(proxy)`)
      }
      return createInnerProxy({
        ...props,
        path: [...path, key]
      });
    },
    apply(_1, _2, [input]): IBaseRPC {
      return {
        input,
        path,
        ...props
      }
    },
  });

  return proxy;
}
