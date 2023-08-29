import { server } from 'zod-sdk/server'
import { callProcedure } from 'server/src/callProcedure'

describe('makeService', () => {
  it('throws error in makeContext', async () => {
    const service = server.makeService({
      makeContext: async () => {
        throw Error('Uncaught exception in makeContext')
      },
    })

    const procedure = service.makeQuery(async () => {
      return 'hello'
    })

    await expect(() =>
      callProcedure(procedure, new Request('http://localhost:3000'))
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      '"Uncaught exception in makeContext"'
    )
  })
})
