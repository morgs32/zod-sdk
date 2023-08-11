import { IRoutes, client } from 'zod-sdk/client'
import { server } from 'zod-sdk/server'
import { makeServer } from './listen'
import { renderHook } from '@testing-library/react-hooks'

const routes = {
  hello: async () => 'world',
} satisfies IRoutes

describe('useQuery', () => {
  it('works', async () => {
    const handler = server.makeRouter(routes)

    await makeServer(handler, async (url) => {
      const sdk = client.makeDispatcher<typeof routes>({
        baseUrl: url,
      })
      const { result } = renderHook(() =>
        client.useQuery(sdk.hello, {
          fn: (hello) => hello(),
        })
      )
      expect(result).toMatchInlineSnapshot()
    })
  })
})
