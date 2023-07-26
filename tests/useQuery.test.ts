import { makeSDK } from 'zod-sdk/internal';
import { useQuery } from '../react/src';
import { routes } from './results.test';


describe('useQuery', () => {
  it('works', async () => {

    const clientSDK = makeSDK<typeof routes>({
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