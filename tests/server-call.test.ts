import { z } from 'zod'
import { server } from 'zod-sdk/server'
import { makeServer } from './listen'

const service1 = server.makeService({
  makeContext: () => ({
    hello: 'world',
  }),
})

async function findMany<T extends 'foo' | 'bar'>(
  this: server.inferThis<typeof service1>,
  discriminator: T,
  date: Date
) {
  return [
    {
      date,
      discriminator,
      hello: this.useCtx().hello,
    },
  ]
}

findMany.parameters = z.tuple([z.enum(['foo', 'bar']), z.date()])
findMany.payload = z.array(
  z.object({
    date: z.date(),
    discriminator: z.enum(['foo', 'bar']),
    hello: z.literal('world'),
  })
)

const router = server.makeRouter({
  widgets: {
    findMany: service1.makeQuery(findMany),
  },
})

describe('server call', () => {
  it('works', async () => {
    await makeServer(router, async (url) => {
      const sdk = server.makeInterface<typeof router.routes>({
        baseUrl: url,
      })
      const result = await server.call(sdk.widgets.findMany, (procedure) =>
        procedure.query('foo', new Date('2023-01-01'))
      )
      // Check the type on result
      expect(result).toMatchInlineSnapshot(`
        [
          {
            "date": 2023-01-01T00:00:00.000Z,
            "discriminator": "foo",
            "hello": "world",
          },
        ]
      `)
    })
  })
})
