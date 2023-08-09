import { z } from 'zod'
import { callHandler, makeService } from 'zod-sdk/server'
import { okrs } from 'okrs'

describe('makeService', () => {
  it('works', async () => {
    const procedure = makeService({
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

    await callHandler(handler, new Request('http://localhost:3000'))
    // try {
    // }
    // catch (e) {
    //   console.error(e)
    // }
  })

  it.skip('check types', async () => {
    const procedure = makeService({
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
