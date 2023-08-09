import { ICompleteRPC, IRequestOptions } from 'zod-sdk/internal'

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
          (input !== undefined ? `?input=${JSON.stringify(input)}` : '')
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
            input !== undefined
              ? JSON.stringify({
                  input,
                })
              : undefined,
        },
      ]
  }
}
