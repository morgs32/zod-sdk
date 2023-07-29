import {
  IHandler,
  IMiddlewareFn,
  IRoutes 
} from 'zod-sdk/internal';
import { asyncLocalStorage } from './asyncLocalStorage';
import { IncomingMessage, OutgoingMessage } from 'http';
import { parseBody } from './parseBody';

interface IOptions {
  onError?: (err: any) => void
  middleware?: IMiddlewareFn
}

export interface IRouter<R extends IRoutes = IRoutes> {
  (req: Request): Promise<Response>
  (req: IncomingMessage, res: OutgoingMessage): Promise<OutgoingMessage<IncomingMessage>>
  GET: (req: Request) => Promise<Response>
  POST: (req: Request) => Promise<Response>
  routes: R
}

function isHandler(handler: any): handler is IHandler {
  return typeof handler.procedure === 'function'
}

export function makeRouter<R extends IRoutes>(routes: R, options: IOptions = {}): IRouter<R> {

  async function router(req: Request): Promise<Response>
  async function router(req: IncomingMessage, res: OutgoingMessage): Promise<OutgoingMessage<IncomingMessage>>
  async function router(req: IncomingMessage | Request, res?: OutgoingMessage): Promise<OutgoingMessage<IncomingMessage> | Response> {

    const url = new URL(req.url!, 'http://localhost')
    const sdkPath = url.pathname.split('/').pop()
    
    if (!sdkPath) {
      throw new Error(`No sdkPath found for url: ${req.url}`)
    }
    
    const handler: IHandler = ((): IHandler => {
      const found = sdkPath
        .split('.')
        .reduce((value, key) => (value as any)?.[key], routes) as IRoutes[keyof IRoutes]
      if (!found) {
        throw new Error(`Route not found: ${sdkPath}`)
      }
      if (isHandler(found)) {
        return found
      }
      throw new Error(`Invalid handler: ${sdkPath}`)
    })()
    
    const middlewares = [handler.middleware, options.middleware].filter(x => x)
    const result = middlewares.length 
      ? await middlewares.reduce((acc: () => Promise<any>, fn) => async () => fn!(req, acc), () => callHandler(handler, req))()
      : await callHandler(handler, req)

    if (result instanceof Response) {
      return result
    }
    if (res) {
      return res.end(JSON.stringify(result))
    }
    return new Response(JSON.stringify(result))
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

export async function callHandler(handler: IHandler, req: IncomingMessage | Request) {
  let context
  try {
    context = handler.makeContext && await handler.makeContext(req)
  }
  catch (e) {
    throw e
  }

  return await asyncLocalStorage.run(context, async () => {

    const method = req.method
    let input: any
    switch (method) {
      case 'GET': {
        const query = Object.fromEntries(new URL(req.url!, 'http://www.trpcplus.com').searchParams)
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
        }
        else {
          body = await parseBody(req)
        }
        if (!body.input && handler.schema) {
          input = handler.schema.parse(body)
          break
        }
        try {
          input = JSON.parse(body.input)
          break
        }
        catch (err) {
          throw new Error(`Error deserializing input: ${body.input}`)
        }
      }
      default: {
        throw new Error(`Method not supported: ${method}`)
      }
    }
    
    const result = await handler.procedure(input)
    if (result instanceof Response) {
      return result
    }

    return {
      result,
      included: {
        // related: 'deal',
        // relatedKey: (deal) => deal.id,
        // So we put relatedKey in for deal
        // And then put back together!
      }
    }

  })
}
