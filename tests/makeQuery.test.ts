import { z } from 'zod'
import { server } from 'zod-sdk/server'
import { makeServer } from './listen'

async function findMany(props: { discriminator: 'foo' | 'bar'; date?: Date }) {
  return props
}

findMany.parameters = z.tuple([
  z.object({
    discriminator: z.enum(['foo', 'bar']),
    date: z.date().optional(),
  }),
])

const router = server.makeRouter({
  widgets: {
    findMany: server.makeQuery(findMany),
  },
})

describe('makeQuery', () => {
  it('server.makeQuery', async () => {
    await makeServer(router, async (url) => {
      const sdk = server.makeInterface<typeof router.routes>({
        baseUrl: url,
      })
      const result = await server.call(sdk.widgets.findMany, (procedure) =>
        procedure.query({
          discriminator: 'foo',
          date: new Date('2023-01-01'),
        })
      )
      // Check the type on result
      expect(result).toMatchInlineSnapshot(`
        {
          "date": "2023-01-01T00:00:00.000Z",
          "discriminator": "foo",
        }
      `)
    })
  })
})
