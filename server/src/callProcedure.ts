import { asyncLocalStorage } from './asyncLocalStorage'
import { parseBody } from './parseBody'
import { makeJsonSchema } from 'zod-sdk/schemas'
import { IProcedure, IRequestType, IResult } from './types'

export async function callProcedure(
  procedure: IProcedure,
  req: IRequestType
): Promise<IResult | Response> {
  let context
  try {
    context = procedure.makeContext && (await procedure.makeContext(req))
  } catch (e) {
    throw e
  }

  return await asyncLocalStorage.run(
    context,
    async (): Promise<IResult | Response> => {
      const method = req.method
      let input: any
      switch (method) {
        case 'GET': {
          const query = Object.fromEntries(
            new URL(req.url!, 'http://www.trpcplus.com').searchParams
          )
          input = query.input
          if (!input) {
            break
          }
          input = JSON.parse(input)
          break
        }
        case 'POST': {
          let body: any
          if (req instanceof Request) {
            body = await req.json()
          } else {
            body = await parseBody(req)
          }
          if (!body.input && procedure.schemas) {
            input = procedure.schemas.parameters.parse(body)
            break
          }
          try {
            input = JSON.parse(body.input)
            break
          } catch (err) {
            throw new Error(`Error deserializing input: ${body.input}`)
          }
        }
        default: {
          throw new Error(`Method not supported: ${method}`)
        }
      }

      const payload = await procedure.fn(input)
      if (payload instanceof Response) {
        return payload
      }

      return {
        payload,
        schema: procedure.schemas && makeJsonSchema(procedure.schemas.payload),
        included: [],
      }
    }
  )
}
