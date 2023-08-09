import { makeQuery, makeRouter } from 'zod-sdk/server';
import { makeServer } from './listen';
import { makeSDK, query } from 'zod-sdk/client';

export const routes = {
  widgets: {
    findMany: makeQuery(async function findMany<T extends 'foo' | 'bar'>(str: T): Promise<{ id: number, type: T, createdAt: Date }[]> {
      return [
        {
          id: 1,
          type: str,
          createdAt: new Date('2020-01-01'),
        }
      ]
    })
  }
}

describe('results', () => {

  it('with http server', async () => {
    const handler = makeRouter(routes)
    await makeServer(handler, async (url) => {
      const clientSDK = makeSDK<typeof routes>({
        baseUrl: url,
      })
      const result = await query(clientSDK.widgets.findMany, findMany => findMany('foo'))
      expect(result[0].createdAt).toMatchInlineSnapshot('"2020-01-01T00:00:00.000Z"')
    })
  });

});