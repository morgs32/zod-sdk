import { z } from 'zod'
import { server } from 'zod-sdk/server'

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

describe('wrong service', () => {
  it('throws error', async () => {
    const service2 = server.makeService()
    server.makeRouter({
      widgets: {
        // @ts-expect-error
        findMany: service2.makeQuery(findMany),
      },
    })
  })
})
