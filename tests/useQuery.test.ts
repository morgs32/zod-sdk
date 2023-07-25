import { createClientSDK } from 'zod-sdk/internal';
import { useQuery } from '../client/src';
import { routes } from './results.test';


describe('useQuery', () => {
  it('works', async () => {

    const clientSDK = createClientSDK<typeof routes>({
      baseUrl: 'http://example.com',
    })

    const {
      data
    } = useQuery(clientSDK.widgets.findMany, {
      fn: query => query('foo')
    })

    expect(data).toMatchInlineSnapshot()

  });
});