import SuperJSON from 'superjson'

describe('superjson', () => {
  it('works', async () => {
    const string = SuperJSON.serialize({
      where: {
        asOfMarketDate: new Date('2023-06-01'),
        dealMonthDate: {
          gte: new Date('2023-06-01')
        }
      }
    })

    expect(string).toMatchInlineSnapshot(`
      {
        "json": {
          "where": {
            "asOfMarketDate": "2023-06-01T00:00:00.000Z",
            "dealMonthDate": {
              "gte": "2023-06-01T00:00:00.000Z",
            },
          },
        },
        "meta": {
          "values": {
            "where.asOfMarketDate": [
              "Date",
            ],
            "where.dealMonthDate.gte": [
              "Date",
            ],
          },
        },
      }
    `)
  })
})
