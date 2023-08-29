import { asyncLocalStorage } from './asyncLocalStorage'
import { parseBody } from './parseBody'
import { makeJsonSchema } from 'zod-sdk/schemas'
import { IProcedure, IRequestType, IResult } from './types'
import z from 'zod'

export async function callProcedure(
  procedure: IProcedure,
  req: IRequestType
): Promise<IResult | Response> {
  if (procedure.middleware) {
    return procedure.middleware(req, () => main(procedure, req))
  }
  return main(procedure, req)
}

async function main(
  procedure: IProcedure,
  req: IRequestType
): Promise<IResult | Response> {
  let context: any
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
            new URL(req.url!, 'http://www.morganatwork.com').searchParams
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
      if (procedure.fn.parameters) {
        const _z = Object.assign({}, z, {
          date: z.coerce.date,
        })
        input = procedure.fn.parameters(_z).parse(input)
      }
      const payload = await procedure.fn.call(
        {
          useCtx: () => context,
        },
        ...input
      )
      if (payload instanceof Response) {
        return payload
      }
      return {
        payload,
        schema: procedure.fn.payload && makeJsonSchema(procedure.fn.payload(z)),
        included: [],
      }
    }
  )
}