import { IncomingMessage, ServerResponse } from 'http'
import { callProcedure } from './callProcedure'
import { IProcedure, IRequestType, IRoutes } from './types'

export interface IRouter {
  (req: Request): Promise<Response>
  (
    req: IncomingMessage,
    res: ServerResponse
  ): Promise<ServerResponse<IncomingMessage>>
  GET: (req: Request) => Promise<Response>
  POST: (req: Request) => Promise<Response>
}

function isProcedure(procedure: any): procedure is IProcedure {
  return typeof procedure.fn === 'function'
}

export function makeRouter<R extends IRoutes>(
  routes: R
): IRouter & {
  routes: R
} {
  async function router(req: Request): Promise<Response>
  async function router(
    req: IncomingMessage,
    res: ServerResponse
  ): Promise<ServerResponse<IncomingMessage>>
  async function router(
    req: IRequestType,
    res?: ServerResponse
  ): Promise<ServerResponse<IncomingMessage> | Response> {
    async function main() {
      const url = new URL(req.url!, 'http://localhost')
      const sdkPath = url.pathname.split('/').pop()

      if (!sdkPath) {
        throw new Error(`No sdkPath found for url: ${req.url}`)
      }

      const procedure: IProcedure = ((): IProcedure => {
        const found = sdkPath
          .split('.')
          .reduce(
            (value, key) => (value as any)?.[key],
            routes
          ) as IRoutes[keyof IRoutes]
        if (!found) {
          throw new Error(`Route not found: ${sdkPath}`)
        }
        if (isProcedure(found)) {
          return found
        }
        if (typeof found === 'function') {
          return {
            fn: found,
            type: req.method === 'GET' ? 'query' : 'command',
          }
        }
        throw new Error(`Invalid procedure: ${sdkPath}`)
      })()

      return callProcedure(procedure, req)
    }
    try {
      const result = await main()
      if (result instanceof Response) {
        return result
      }
      if (res) {
        return res.end(JSON.stringify(result))
      }
      return new Response(JSON.stringify(result))
    } catch (e) {
      if (e instanceof Error) {
        if (res) {
          res.statusCode = 500
          return res.end(e.message)
        }
        return new Response(e.message, { status: 500 })
      }
      if (res) {
        res.statusCode = 500
        return res.end(`Unknown error: ${e}`)
      }
      return new Response(`Unknown error: ${e}`, { status: 500 })
    }
  }

  router.GET = (req: Request) => {
    return router(req)
  }
  router.POST = (req: Request) => {
    return router(req)
  }
  router.routes = routes
  return router
}
