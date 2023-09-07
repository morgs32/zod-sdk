import { zutils } from 'zod-utils'
import { z } from 'zod'
import { server } from 'zod-sdk/server'
import { makeServer } from './listen'
import { makeParameters } from 'server/src/makeParameters'
import { makePayload } from 'server/src/makePayload'

describe('results', () => {
  it('with http server', async () => {
    async function addYear(date: Date = new Date()) {
      return new Date(date.getFullYear() + 1, date.getMonth(), date.getDate())
    }

    addYear.parameters = makeParameters(addYear, z.tuple([z.date().optional()]))
    zutils.check(addYear.parameters, {} as any as Parameters<typeof addYear>)
    addYear.payload = makePayload(addYear, z.date())
    zutils.check(
      addYear.payload,
      {} as any as Awaited<ReturnType<typeof addYear>>
    )

    const router = server.makeRouter({
      widgets: {
        addYear: server.makeQuery(addYear),
      },
    })
    await makeServer(router, async (url) => {
      const sdk = server.makeInterface<typeof router.routes>({
        baseUrl: url,
      })
      const result = await server.call(sdk.widgets.addYear, ({ query }) =>
        query()
      )
      expect(result).toBeInstanceOf(Date)
    })
  })

  it('with bad payload schema', async () => {
    async function addYear() {
      return 'foobar' as any as Date
    }
    addYear.payload = z.date()

    const router = server.makeRouter({
      widgets: {
        addYear: server.makeQuery(addYear),
      },
    })
    await makeServer(router, async (url) => {
      const sdk = server.makeInterface<typeof router.routes>({
        baseUrl: url,
      })
      await expect(() => {
        try {
          return server.call(sdk.widgets.addYear, ({ query }) => query())
        } catch (e) {
          console.log(e)
        }
      }).rejects.toThrowError()
    })
  })
})
