import { server } from 'zod-sdk/server'
import { inferThis } from 'server/src/makeService'

describe('makeService', () => {
  it('mock useCtx', async () => {
    const service = server.makeService({
      makeContext: async () => {
        return {
          foo: 'bar',
        }
      },
    })

    async function fn(this: inferThis<typeof service>) {
      return this.useCtx()
    }

    const a = await fn.call({ useCtx: () => ({ foo: 'baz' }) })

    expect(a).toMatchInlineSnapshot(`
      {
        "foo": "baz",
      }
    `)
  })
})
