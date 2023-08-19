import { z } from 'zod'
import { okrs } from 'okrs'
import { server } from 'zod-sdk/server'
import { callHandler } from 'server/src/callHandler'

describe('makeService', () => {
  it('throws error in makeContext', async () => {
    const service = server.makeService({
      makeContext: async () => {
        okrs.strict(() => {
          z.string({
            invalid_type_error: 'x-lhc-workspace-key header is required',
          }).parse(null)
        })
      },
    })

    const handler = service.makeProcedure(async () => {
      return 'hello'
    })

    await expect(() =>
      callHandler(handler, new Request('http://localhost:3000'))
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      '"x-lhc-workspace-key header is required"'
    )
  })

  it('hmm', async () => {
    const service = server.makeService({
      makeContext: async () => {
        return {
          foo: 'bar',
        } as const
      },
    })

    const handler = service.makeProcedure(async function (this) {
      return this.useCtx()
    })

    expect(
      await callHandler(handler, new Request('http://localhost:3000'))
    ).toMatchInlineSnapshot()
  })

  it('mockCtx', async () => {
    const service = server.makeService({
      middleware: async (req: Request) => {
        expect(req).toBeTruthy()
      },
      makeContext: async (req) => {
        expect(req).toBeTruthy()
        return {
          foo: 'bar',
        }
      },
    })

    const a = await service.mockCtx(
      {
        foo: 'baz',
      },
      async function fn(this) {
        return this.useCtx()
      }
    )
    expect(a).toMatchInlineSnapshot(`
      {
        "foo": "baz",
      }
    `)

    const handler = service.makeProcedure(async () => {
      return 'hello'
    })
    expect(handler).toBeTruthy()
  })
})
