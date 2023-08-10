import { server } from 'zod-sdk/server'
import { makeServer } from './listen'
import { sdk } from 'zod-sdk/internal'

const findMany = server.makeQuery(async function findMany<
  T extends 'foo' | 'bar',
>(str: T): Promise<{ id: number; type: T; createdAt: Date }[]> {
  return [
    {
      id: 1,
      type: str,
      createdAt: new Date('2020-01-01'),
    },
  ]
})

const routes = {
  widgets: {
    findMany,
  },
}

describe('results', () => {
  it('with http server', async () => {
    const handler = server.makeRouter(routes)
    await makeServer(handler, async (url) => {
      const clientSDK = sdk.makeSDK<typeof routes>({
        baseUrl: url,
      })
      const result = await sdk.query(clientSDK.widgets.findMany, (findMany) =>
        findMany('foo')
      )
      expect(result[0].createdAt).toMatchInlineSnapshot(
        '"2020-01-01T00:00:00.000Z"'
      )
    })
  })

  it('type narrows', async () => {
    async function findFooOrBar<T extends 'foo' | 'bar'>(
      str: T
    ): Promise<T extends 'foo' ? 'found-foo' : 'found-bar'> {
      return (str === 'foo' ? 'found-foo' : 'found-bar') as any
    }
    const routes = {
      findFooOrBar: server.makeQuery(findFooOrBar),
    }
    // You have to use routes!!
    const handler = server.makeRouter(routes)
    await makeServer(handler, async (url) => {
      const clientSDK = sdk.makeSDK<typeof handler.routes>({
        baseUrl: url,
      })
      const result = await sdk.query(clientSDK.findFooOrBar, (find) =>
        find('foo')
      )
      // Check the type on result
      expect(result).toMatchInlineSnapshot('"found-foo"')
    })
  })

  it.only('with context', async () => {
    const procedure = server.makeService({
      makeContext: () => ({
        foo: 'bar',
      }),
    })
    async function findFooOrBar<T extends 'foo' | 'bar'>(
      str: T
    ): Promise<T extends 'foo' ? 'found-foo' : 'found-bar'> {
      const { foo } = procedure.useCtx()
      expect(foo).toMatchInlineSnapshot('"bar"')
      return (str === foo ? 'found-foo' : 'found-bar') as any
    }
    const routes = {
      findFooOrBar: server.makeQuery(findFooOrBar),
    }
    // You have to use routes!!
    const handler = server.makeRouter(routes)
    await makeServer(handler, async (url) => {
      const clientSDK = sdk.makeSDK<typeof handler.routes>({
        baseUrl: url,
      })
      const result = await sdk.query(clientSDK.findFooOrBar, (find) => {
        return find('foo')
      })
      // Check the type on result
      expect(result).toMatchInlineSnapshot('"found-bar"')
    })
  })
})
