import { IHandler, IResult } from 'zod-sdk/internal'
import { asyncLocalStorage } from './asyncLocalStorage'
import { IncomingMessage } from 'http'
import { parseBody } from './parseBody'
import { makeJsonSchema, parseJsonSchema } from 'zod-sdk/schemas'

export async function callHandler(
  handler: IHandler,
  req: IncomingMessage | Request
): Promise<IResult | Response> {
  let context
  try {
    context = handler.makeContext && (await handler.makeContext(req))
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
          if (!body.input && handler.schemas) {
            const schemas = handler.schemas
            input = parseJsonSchema(
              makeJsonSchema(schemas.parameter) as any
            ).parse(body)
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

      const payload = await handler.fn(input)
      if (payload instanceof Response) {
        return payload
      }

      return {
        payload,
        schema: handler.schemas && makeJsonSchema(handler.schemas.payload),
        included: [],
      }
    }
  )
}
