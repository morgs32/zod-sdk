import { server, IRoutes } from 'zod-sdk/server'
import { makeServer } from './listen'
import { client } from 'zod-sdk/client'

async function findMany<T extends 'foo' | 'bar'>(this: typeof service, str: T) {
  return [
    {
      id: 1,
      type: str,
      foo: this.useCtx().foo,
      createdAt: new Date('2020-01-01'),
    },
  ]
}

const service = server.makeService({
  makeContext: () => ({
    foo: 'bar',
  }),
})

const anotherService = server.makeService({
  makeContext: () => ({
    baz: 'qux',
  }),
})

// @ts-expect-error
findMany.procedure = anotherService.makeProcedure(findMany) // TODO: Should throw

const routes = {
  widgets: {
    findMany: findMany.procedure,
    foobar: server.makeProcedure(async (foo: string) => foo),
  },
} satisfies IRoutes

describe('results', () => {
  it('with http server', async () => {
    const procedure = server.makeRouter({
      widgets: {
        findMany: findMany.procedure,
      },
    }) // TODO: Needs to require service.makeRouter
    await makeServer(procedure, async (url) => {
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
    const procedure = server.makeRouter(routes)
    await makeServer(procedure, async (url) => {
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

  it('with context', async () => {
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
    const procedure = server.makeRouter(routes)
    await makeServer(procedure, async (url) => {
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
