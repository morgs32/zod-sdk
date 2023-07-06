import { createClientSDK } from '../src/client/createClientSDK';
import { fetchAdapter } from '../src/client/fetchAdapter';
import { createServerRouter } from '../src/server/createServerRouter';
import { makeServer } from './listen';

const routes = {
  widgets: {
    queries: {
      findMany: async () => {
        return [
          {
            id: 1,
            createdAt: new Date('2020-01-01'),
          }
        ]
      }
    }
  }
}

describe('results', () => {

  it('with http server', async () => {
    await makeServer(createServerRouter(routes), async (url) => {
      const clientSDK = createClientSDK<typeof routes>({
        baseUrl: url,
      })
      const result = await clientSDK.widgets.queries.findMany()
      expect(result[0].createdAt).toBeInstanceOf(Date)
    })
  });

  it('with fetch API', async () => {
    const router = createServerRouter(routes)
    const clientSDK = createClientSDK<typeof routes>({
      baseUrl: 'http://localhost',
    })
    const { 
      fetchArgs,
      parseRes,
    } = fetchAdapter(clientSDK, {
      fn: sdk => sdk.widgets.queries.findMany(),
    })
    const res = await router(new Request(...fetchArgs))
    const result = await parseRes(res)
    expect(result[0].createdAt).toBeInstanceOf(Date)
  });


});