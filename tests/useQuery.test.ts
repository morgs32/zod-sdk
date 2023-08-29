// @vitest-environment jsdom
import { client } from 'zod-sdk/client'
import { server } from 'zod-sdk/server'
import { makeServer } from './listen'
import { waitFor, renderHook } from '@testing-library/react'

describe('useQuery', () => {
  it('works', async () => {
    const router = server.makeRouter({
      hello: server.makeQuery(async () => {
        return 'world'
      }),
    })

    await makeServer(router, async (url) => {
      const sdk = client.makeInterface<typeof router.routes>({
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
