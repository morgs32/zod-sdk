import { makeQuery, makeRouter } from 'zod-sdk/server'
import { makeServer } from './listen'
import { makeSDK, query } from 'zod-sdk/internal'
import z from 'zod'
const findMany = makeQuery(
  async function findMany<T extends 'foo' | 'bar'>(
    str: T
  ): Promise<{ id: number; type: T; createdAt: Date }[]> {
    return [
      {
        id: 1,
        type: str,
        createdAt: new Date('2020-01-01'),
      },
    ]
  },
  {
    parameter: z.union([z.literal('foo'), z.literal('bar')]),
    result: z.array(
      z.object({
        id: z.number(),
        type: z.union([z.literal('foo'), z.literal('bar')]),
        createdAt: z.date(),
      })
    ),
  }
)
export const routes = {
  widgets: {
    findMany,
  },
}

describe('results', () => {
  it('with http server', async () => {
    const router = makeRouter(routes)
    await makeServer(router, async (url) => {
      const clientSDK = makeSDK<typeof routes>({
        baseUrl: url,
      })
      const result = await query(clientSDK.widgets.findMany, (findMany) =>
        findMany('foo')
      )
      expect(typeof result[0].createdAt).toMatchInlineSnapshot('"object"')
      expect(result[0].createdAt).toMatchInlineSnapshot(
        '2020-01-01T00:00:00.000Z'
      )
    })
  })
})
