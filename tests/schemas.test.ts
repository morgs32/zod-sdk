import { server } from 'zod-sdk/server'
import { makeServer } from './listen'

async function addYear(date: Date) {
  return new Date(date.getFullYear() + 1, date.getMonth(), date.getDate())
}

addYear.parameters = server.makeSchemas((z) => z.tuple([z.date()]))
addYear.payload = server.makeSchemas((z) => z.date())

describe('results', () => {
  it('with http server', async () => {
    const router = server.makeRouter({
      widgets: {
        addYear: server.makeQuery(addYear),
      },
    })
    await makeServer(router, async (url) => {
      const sdk = server.makeInterface<typeof router.routes>({
        baseUrl: url,
      })
      const result = await server.call(sdk.widgets.addYear, ({ query }) =>
        query(new Date('2020-01-01'))
      )
      expect(result).toMatchInlineSnapshot('2020-12-31T05:00:00.000Z')
    })
  })
})
