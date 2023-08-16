import { server } from 'zod-sdk/server'
import { makeServer } from './listen'
import z from 'zod'

const addYear = server.makeQuery(
  async function (date: Date) {
    return new Date(date.getFullYear() + 1, date.getMonth(), date.getDate())
  },
  {
    parameter: z.date(),
    payload: z.date(),
  }
)

const somethingAndTuples = server.makeQuery(
  async function (_: { foo: 'bar' }) {
    return [[new Date(), 1]]
  },
  {
    parameter: z.object({
      foo: z.literal('bar'),
    }),
    payload: z.array(z.tuple([z.date(), z.number()])),
  }
)

const findFoobar = server.makeQuery(
  async function findFoobar<T extends 'foo' | 'bar'>(
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
    payload: z.array(
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
    queries: {
      findFoobar,
      addYear,
      somethingAndTuples,
    },
  },
}

describe('results', () => {
  it('with http server', async () => {
    const router = server.makeRouter(routes)
    await makeServer(router, async (url) => {
      const sdk = server.makeDispatcher<typeof routes>({
        baseUrl: url,
      })
      const result = await server.query(
        sdk.widgets.queries.findFoobar,
        (findFoobar) => findFoobar('foo')
      )
      expect(typeof result[0].createdAt).toMatchInlineSnapshot('"object"')
      expect(result[0].createdAt).toMatchInlineSnapshot(
        '2020-01-01T00:00:00.000Z'
      )
    })
  })
})
