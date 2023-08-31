import { z } from 'zod'
import { server } from 'zod-sdk/server'
import { makeServer } from './listen'
import { vi } from 'vitest'

describe('server call', () => {
  it('works', async () => {
    const spy = vi.fn()
    async function findMany<T extends 'foo' | 'bar'>(
      discriminator: T,
      date: Date
    ) {
      spy()
      await new Promise((resolve) => setTimeout(resolve, 100))
      return {
        date,
        discriminator,
      }
    }

    findMany.parameters = z.tuple([z.enum(['foo', 'bar']), z.date()])
    findMany.payload = z.object({
      date: z.date(),
      discriminator: z.enum(['foo', 'bar']),
    })

    const router = server.makeRouter({
      widgets: {
        findMany: server.makeQuery(findMany),
      },
    })
    await makeServer(router, async (url) => {
      const sdk = server.makeInterface<typeof router.routes>({
        baseUrl: url,
      })
      const fn = () =>
        server.call(sdk.widgets.findMany, (procedure) =>
          procedure.query('foo', new Date('2023-01-01'))
        )
      const results = await Promise.all([fn(), fn()])
      expect(spy).toHaveBeenCalledTimes(1)
      expect(results[0]).toMatchInlineSnapshot(`
        {
          "date": 2023-01-01T00:00:00.000Z,
          "discriminator": "foo",
        }
      `)
      expect(results[0]).toEqual(results[1])

      await fn()
      expect(spy).toHaveBeenCalledTimes(2)
    })
  })
})
