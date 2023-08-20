import {
  IProcedure,
  IMiddlewareFn,
  IRequestType,
  IRoutes,
  IOnlyFunc,
} from 'zod-sdk/internal'
import { IncomingMessage, ServerResponse } from 'http'
import { callProcedure } from './callProcedure'

export interface IOptions {
  onError?: (err: any) => void
  middleware?: IMiddlewareFn
}

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

type ICheckRoutes<R extends IRoutes> = {
  [K in keyof R]: R[K] extends IProcedure
    ? R[K]
    : R[K] extends IOnlyFunc<[]>
    ? IProcedure<R[K]>
    : R[K] extends IOnlyFunc
    ? IProcedure<R[K]>
    : never
}

export function makeRouter<R extends IRoutes>(
  routes: R,
  options: IOptions = {}
): IRouter {
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
            schemas: undefined,
            type: req.method === 'GET' ? 'query' : 'command',
          }
        }
        throw new Error(`Invalid procedure: ${sdkPath}`)
      })()

      const middlewares = [procedure.middleware, options.middleware].filter(
        (x) => x
      )
      return middlewares.length
        ? await middlewares.reduce(
            (acc: () => Promise<any>, fn) => async () => fn!(req, acc),
            () => callProcedure(procedure, req)
          )()
        : await callProcedure(procedure, req)
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
      if (options.onError) {
        options.onError(e)
      } else {
        console.error(e)
      }
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
