// @vitest-environment jsdom
import { client } from 'zod-sdk/client'
import { IRoutes, server } from 'zod-sdk/server'
import { makeServer } from './listen'
import { waitFor, renderHook } from '@testing-library/react'

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
        client.useQuery([sdk.hello, 'foobar'], (procedure, foobar) => {
          expect(foobar).toEqual('foobar')
          return procedure.query()
        })
      )
      await waitFor(() => expect(result.current.data).toEqual('world'))
    })
  })
})
