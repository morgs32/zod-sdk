import {
  IHandler,
  IMiddlewareFn,
  IRoutes 
} from 'okrpc/internal';
import { asyncLocalStorage } from './asyncLocalStorage';
import { IncomingMessage, OutgoingMessage } from 'http';
import { parseBody } from './parseBody';
import SuperJSON from 'superjson';


interface IOptions {
  onError?: (err: any) => Response
  middleware?: IMiddlewareFn
}

export interface IRouter<R extends IRoutes = IRoutes> {
  (req: IncomingMessage | Request, httpRes?: OutgoingMessage): Promise<Response>
  routes: R
}

function isHandler(handler: any): handler is IHandler {
  return typeof handler.procedure === 'function'
}

export function createServerRouter<R extends IRoutes>(routes: R, options: IOptions = {}): IRouter<R> {

  async function qrpcRouter(req: IncomingMessage | Request, res?: OutgoingMessage) {

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
      if (typeof found === 'function') {
        return { 
          procedure: found,
        }
      }
      if (isHandler(found)) {
        return found
      }
      throw new Error(`Invalid handler: ${sdkPath}`)
    })()
    
    
    
    /**
     * Then catch that and do what?
    */
   
    try {
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
    catch (e) {
      console.error(e)
      if (options.onError) return options.onError(e)
      if (res) {
        // res.set
        return res.end(String(e))
      }
      return new Response(JSON.stringify(e), { status: 500 })
    }
  }

  qrpcRouter.routes = routes;
  // @ts-ignore
  return qrpcRouter;

}

async function callHandler(handler: IHandler, req: IncomingMessage | Request) {
  const context = handler.createContext && await handler.createContext(req)

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
        if (typeof input === 'string') {
          input = JSON.parse(input)
        }
        input = SuperJSON.deserialize(input)
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
          input = SuperJSON.deserialize(JSON.parse(body.input))
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
    
    const res = await handler.procedure(input)
    if (res instanceof Response) {
      return res
    }

    // TODO: Handle remapping of results. Maybe result.data should have everything?
    return SuperJSON.serialize({
      result: res,
      included: {
        // related: 'deal',
        // relatedKey: (deal) => deal.id,
        // So we put relatedKey in for deal
        // And then put back together!
      }
    })

  })
}
