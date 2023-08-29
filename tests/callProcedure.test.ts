import { server } from 'zod-sdk/server'
import { callProcedure } from 'server/src/callProcedure'

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

    expect(await callProcedure(procedure, new Request('http://localhost:3000')))
      .toMatchInlineSnapshot(`
      {
        "included": [],
        "payload": {
          "foo": "bar",
          "str": undefined,
        },
        "schema": undefined,
      }
    `)
  })
})
