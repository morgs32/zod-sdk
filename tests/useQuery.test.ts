// @vitest-environment jsdom
import { client } from 'zod-sdk/client'
import { IRoutes, server } from 'zod-sdk/server'
import { makeServer } from './listen'
import { renderHook } from '@testing-library/react-hooks'
import { waitFor } from '@testing-library/react'

const routes = {
  hello: async () => {
    return 'world'
  },
} satisfies IRoutes

describe('useQuery', () => {
  it('works', async () => {
    const procedure = server.makeRouter(routes)

    await makeServer(procedure, async (url) => {
      const sdk = client.makeInterface<typeof routes>({
        baseUrl: url,
      })
      const { result } = renderHook(() =>
        client.useQuery([sdk.hello, 'foobar'], (hello, foobar) => {
          expect(foobar).toEqual('foobar')
          return hello()
        })
      )
      await waitFor(() => expect(result.current.data).toEqual('world'))
    })
  })
})
