import { server } from 'zod-sdk/server'
import { vi } from 'vitest'
import { inferThis } from 'server/src/makeService'
import { callProcedure } from 'server/src/callProcedure'
import { makeFetchArgs } from 'internal/src/makeFetchArgs'

describe('makeService', () => {
  it('mockCtx', async () => {
    const middlewareSpy = vi.fn()
    const makeContextSpy = vi.fn()
    const service = server.makeService({
      middleware: async () => {
        middlewareSpy()
      },
      makeContext: async () => {
        makeContextSpy()
        return {
          foo: 'bar',
        }
      },
    })

    const a = await service.mockCtx(
      {
        foo: 'baz',
      },
      async function fn(this: inferThis<typeof service>) {
        return this.useCtx()
      }
    )
    expect(a).toMatchInlineSnapshot(`
      {
        "foo": "baz",
      }
    `)

    const procedure = service.makeQuery(async () => {
      return 'hello'
    })
    await callProcedure(
      procedure,
      new Request(
        ...makeFetchArgs({
          input: [],
          type: 'query',
          baseUrl: 'https://www.example.com',
          path: [],
        })
      )
    )
    expect(makeContextSpy).toHaveBeenCalled()
    expect(middlewareSpy).toHaveBeenCalled()
  })
})
