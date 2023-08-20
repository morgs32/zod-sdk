import { z } from 'zod'
import { okrs } from 'okrs'
import { server } from 'zod-sdk/server'
import { callProcedure } from 'server/src/callProcedure'

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

    const procedure = service.makeProcedure(async () => {
      return 'hello'
    })

    await expect(() =>
      callProcedure(procedure, new Request('http://localhost:3000'))
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

    const procedure = service.makeProcedure(async function (str: string) {
      return {
        foo: this.useCtx().foo,
        str,
      }
    })

    expect(await callProcedure(procedure, new Request('http://localhost:3000')))
      .toMatchInlineSnapshot(`
      {
        "included": [],
        "payload": {
          "foo": "bar",
          "str": undefined,
        },
        "schema": undefined,
      }
    `)
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

    const procedure = service.makeProcedure(async () => {
      return 'hello'
    })
    expect(procedure).toBeTruthy()
  })
})
