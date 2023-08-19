import { server } from 'zod-sdk/server'
import { client } from 'zod-sdk/client'
import { makeServer } from './listen'
import { IHandler, IRoutes } from 'zod-sdk/internal'

const findMany = server.makeProcedure(async function findMany<
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
} satisfies IRoutes

describe('results', () => {
  it('with interface and no schemas', () => {
    interface Props {
      foo: 'bar'
    }

    const findMany: IHandler = server.makeProcedure(async (props: Props) => {
      return props.foo
    })
    expect(findMany).toBeDefined()
  })

  it('with http server', async () => {
    const handler = server.makeRouter(routes)
    await makeServer(handler, async (url) => {
      const sdk = client.makeInterface<typeof routes>({
        baseUrl: url,
      })
      const result = await client.call(sdk.widgets.findMany, ({ query }) =>
        query('foo')
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
      findFooOrBar: server.makeProcedure(findFooOrBar),
    }
    // You have to use routes!!
    const handler = server.makeRouter(routes)
    await makeServer(handler, async (url) => {
      const sdk = client.makeInterface<typeof routes>({
        baseUrl: url,
      })
      const result = await client.call(sdk.findFooOrBar, ({ query }) =>
        query('foo')
      )
      // Check the type on result
      expect(result).toMatchInlineSnapshot('"found-foo"')
    })
  })

  it.only('with context', async () => {
    const service = server.makeService({
      makeContext: (): { foo: 'bar' } => ({
        foo: 'bar',
      }),
      middleware: (_, next) => {
        // console.log('middleware', req)
        return next()
      },
    })
    async function getContextFoo() {
      const { foo } = service.useCtx()
      expect(foo).toMatchInlineSnapshot('"bar"')
      return `found-${foo}` as const
    }
    const routes = {
      getContextFoo: service.makeProcedure(getContextFoo),
    }
    // You have to use routes!!
    const handler = server.makeRouter(routes)
    await makeServer(handler, async (url) => {
      const sdk = client.makeInterface<typeof routes>({
        baseUrl: url,
      })
      const result = await client.call(sdk.getContextFoo, ({ query }) =>
        query()
      )
      // Check the type on result
      expect(result).toMatchInlineSnapshot('"found-bar"')
    })
  })
})
