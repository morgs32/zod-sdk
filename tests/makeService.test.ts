import { z } from 'zod'
import { okrs } from 'okrs'
import { server, callHandler } from 'zod-sdk/server'

describe('makeService', () => {
  it('works', async () => {
    const procedure = server.makeService({
      makeContext: async () => {
        okrs.strict(() => {
          z.string({
            invalid_type_error: 'x-lhc-workspace-key header is required',
          }).parse(null)
        })
      },
    })

    const handler = procedure.makeQuery(async () => {
      return 'hello'
    })

    await expect(() =>
      callHandler(handler, new Request('http://localhost:3000'))
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      '"x-lhc-workspace-key header is required"'
    )
  })

  it.skip('check types', async () => {
    const procedure = server.makeService({
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

    const a = procedure.mockCtx(
      {
        foo: 'baz',
      },
      async () => {}
    )
    expect(a).toBeTruthy()

    const handler = procedure.makeQuery(async () => {
      return 'hello'
    })
    expect(handler).toBeTruthy()
  })
})
