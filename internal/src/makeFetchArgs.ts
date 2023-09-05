import { ICompleteRPC, IRequestOptions } from 'zod-sdk/server'

export function makeFetchArgs(
  rpc: ICompleteRPC,
  options?: IRequestOptions
): [string, IRequestOptions] {
  const { baseUrl, input, path, type } = rpc
  const routePath = path.join('.')

  switch (type) {
    case 'query':
      return [
        `${baseUrl}/${
          routePath +
          (input.length > 0 ? `?input=${JSON.stringify(input)}` : '')
        }`,
        {
          ...options,
          method: 'GET',
        },
      ]
    case 'command':
      return [
        `${baseUrl}/${routePath}`,
        {
          ...options,
          method: 'POST',
          headers: {
            ...options?.headers,
            'Content-Type': 'application/json',
          },
          body:
            input.length > 0
              ? JSON.stringify({
                  input,
                })
              : undefined,
        },
      ]
  }
}
