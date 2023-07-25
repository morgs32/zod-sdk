import { createProcedure } from '.';


describe('createProcedure', () => {
  it('works', async () => {
    
    const procedure = createProcedure({
      middleware: async (req: Request) => {

      },
      createContext: async (req) => {
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