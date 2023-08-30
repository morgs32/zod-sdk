import { call, inferFn, inferReturn } from 'zod-sdk/internal'
import { server } from 'zod-sdk/server'
import { makeServer } from './listen'

async function hello() {
  return 'world'
}

describe('infer', () => {
  it('works', async () => {
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
})
