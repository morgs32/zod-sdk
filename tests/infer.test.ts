import { call, inferFn, inferReturn } from 'zod-sdk/internal'
import { server } from 'zod-sdk/server'
import { makeServer } from './listen'
import { inferThis } from 'server/src/makeService'

describe('infer', () => {
  it('works', async () => {
    async function hello() {
      return 'world'
    }

    const router = server.makeRouter({
      widgets: {
        hello: server.makeQuery(hello),
      },
    })
    await makeServer(router, async (url) => {
      const sdk = server.makeInterface<typeof router.routes>({
        baseUrl: url,
      })

      type fn = inferFn<typeof sdk.widgets.hello>
      type res = inferReturn<typeof sdk.widgets.hello>

      let a: res
      a = await call(sdk.widgets.hello, (procedure) => {
        let b: fn
        b = procedure.query
        return b()
      })
      expect(a).toMatchInlineSnapshot('"world"')
    })
  })

  it('works with this', async () => {
    const service = server.makeService({
      makeContext: () => ({ a: 1 }),
    })
    async function hello(this: inferThis<typeof service>) {
      return 'world'
    }

    const router = server.makeRouter({
      widgets: {
        hello: service.makeQuery(hello),
      },
    })
    await makeServer(router, async (url) => {
      const sdk = server.makeInterface<typeof router.routes>({
        baseUrl: url,
      })

      type fn = inferFn<typeof sdk.widgets.hello>
      type res = inferReturn<typeof sdk.widgets.hello>

      let a: res
      a = await call(sdk.widgets.hello, (procedure) => {
        let b: fn
        b = procedure.query
        // @ts-expect-error
        expect(b()).toEqual({
          baseUrl: expect.any(String),
          input: [],
          path: ['widgets', 'hello'],
          type: 'query',
        })
        return procedure.query()
      })
      expect(a).toMatchInlineSnapshot('"world"')
    })
  })
})
