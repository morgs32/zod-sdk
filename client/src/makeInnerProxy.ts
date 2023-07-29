import { IBaseRPC } from 'zod-sdk/internal';

const noop = () => {}

interface IProps {
  path?: string[]
  baseUrl: string
}

export function makeInnerProxy(props: IProps) {

  const {
    path = [],
  } = props

  const proxy: unknown = new Proxy(noop, {
    get(_obj, key) {
      if (typeof key !== 'string' || key === 'then') {
        return undefined; // Special case for if the proxy is accidentally treated like a PromiseLike (like in `Promise.resolve(proxy)`)
      }
      return makeInnerProxy({
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
