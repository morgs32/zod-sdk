// @ts-nocheck
import { makeService } from '.';


describe('makeService', () => {
  it('works', async () => {
    
    const procedure = makeService({
      middleware: async (req: Request) => {

      },
      makeContext: async (req) => {
        return {
          foo: 'bar'
        }
      }
    })

    const a = procedure.mockCtx({
      foo: 'baz'
    }, async () => {
      
    })

    const handler = procedure.makeQuery(async () => {
      return 'hello'
    })

  });
});