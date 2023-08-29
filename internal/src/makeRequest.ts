import { ICompleteRPC, IRequestOptions } from 'zod-sdk/server'

export function makeRequest(
  rpc: ICompleteRPC,
  options?: IRequestOptions
): Request {
  const { baseUrl, input, path, type } = rpc

  const routePath = path.join('.')

  switch (type) {
    case 'query':
      return new Request(
        `${baseUrl}/${
          routePath +
          (input !== undefined ? `?input=${JSON.stringify(input)}` : '')
        }`,
        {
          ...options,
          method: 'GET',
        }
      )
    case 'command':
      return new Request(`${baseUrl}/${routePath}`, {
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
      })
  }
}
