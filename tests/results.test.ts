import { server, IRoutes } from 'zod-sdk/server'
import { makeServer } from './listen'
import { client } from 'zod-sdk/client'
import z from 'zod'

async function findMany<T extends 'foo' | 'bar'>(
  this: Pick<typeof fooService, 'useCtx'>,
  str: T
) {
  return [
    {
      id: 1,
      type: str,
      foo: this.useCtx().foo,
      createdAt: new Date('2020-01-01'),
    },
  ]
}

const fooService = server.makeService({
  makeContext: () => ({
    foo: 'bar',
  }),
})

const bazService = server.makeService({
  makeContext: () => ({
    baz: 'qux',
  }),
})

findMany.procedure = fooService.makeProcedure(findMany)
findMany.withSchemas = fooService.makeProcedure(findMany, {
  schemas: {
    parameters: z.tuple([z.enum(['foo', 'bar'])]),
    payload: z.array(
      z.object({
        id: z.number(),
        type: z.union([z.literal('foo'), z.literal('bar')]),
        foo: z.string(),
        createdAt: z.date(),
      })
    ),
  },
  makeContext: () => ({
    baz: 'qux',
  }),
})

const routes = {
  widgets: {
    findMany: findMany.procedure,
    findManyWithSchemas: findMany.withSchemas,
    foobar: server.makeProcedure(async (foo: string) => foo),
  },
} satisfies IRoutes

describe('results', () => {
  it('with wrong service', async () => {
    // @ts-expect-error
    const wrongService = bazService.makeProcedure(findMany)
    expect(wrongService).toBeDefined()
  })

  it('with http server', async () => {
    const procedure = server.makeRouter({
      widgets: {
        findMany: findMany.procedure,
      },
    })
    await makeServer(procedure, async (url) => {
      const sdk = client.makeInterface<typeof routes>({
        baseUrl: url,
      })
      const result = await client.call(sdk.widgets.findMany, (procedure) =>
        procedure.query('foo')
      )
      expect(result[0].createdAt).toMatchInlineSnapshot(
        '"2020-01-01T00:00:00.000Z"'
      )
      const anotherResult = await client.call(
        sdk.widgets.findManyWithSchemas,
        (procedure) => procedure.query('foo')
      )
      expect(anotherResult[0].createdAt).toMatchInlineSnapshot(
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
