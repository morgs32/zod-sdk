import { useQuery } from 'zod-sdk/client'
import { makeSDK } from 'zod-sdk/internal'
import { routes } from '../../tests/results.test'

describe.skip('useQuery', () => {
  it('works', async () => {
    const clientSDK = makeSDK<typeof routes>({
      baseUrl: 'http://example.com',
    })

    const { data } = useQuery(clientSDK.widgets.findMany, {
      fn: (query) => query('foo'),
    })

    expect(data).toMatchInlineSnapshot()
  })
})
