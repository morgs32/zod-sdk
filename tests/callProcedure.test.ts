import { vi } from 'vitest'
import { server } from 'zod-sdk/server'
import { callProcedure } from 'server/src/callProcedure'
import { makeFetchArgs } from 'internal/src/makeFetchArgs'

describe('callProcedure', () => {
  it('works', async () => {
    const service = server.makeService({
      makeContext: async () => {
        return {
          hello: 'world' as const,
        }
      },
    })

    const procedure = service.makeQuery(async function (str: string) {
      return {
        hello: this.useCtx().hello,
        str,
      }
    })

    expect(
      await callProcedure(
        procedure,
        new Request(
          ...makeFetchArgs({
            input: ['foo'],
            type: 'query',
            path: [],
            baseUrl: 'https://www.example.com',
          })
        )
      )
    ).toMatchInlineSnapshot(`
      {
        "included": [],
        "payload": {
          "hello": "world",
          "str": "foo",
        },
        "schema": undefined,
      }
    `)
  })

  it('calls middleware and makeContext', async () => {
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

    const query = service.makeQuery(async () => {
      return 'hello'
    })
    await callProcedure(
      query,
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
