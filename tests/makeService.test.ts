import { z } from 'zod'
import { okrs } from 'okrs'
import { server } from 'zod-sdk/server'
import { callHandler } from 'server/src/callHandler'

describe('makeService', () => {
  it('works', async () => {
    const service = server.makeService({
      makeContext: async () => {
        okrs.strict(() => {
          z.string({
            invalid_type_error: 'x-lhc-workspace-key header is required',
          }).parse(null)
        })
      },
    })

    const handler = service.makeProcedure('query', async () => {
      return 'hello'
    })

    await expect(() =>
      callHandler(handler, new Request('http://localhost:3000'))
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      '"x-lhc-workspace-key header is required"'
    )
  })

  it.skip('check types', async () => {
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

    const a = service.mockCtx(
      {
        foo: 'baz',
      },
      async () => {}
    )
    expect(a).toBeTruthy()

    const handler = service.makeProcedure('query', async () => {
      return 'hello'
    })
    expect(handler).toBeTruthy()
  })
})
