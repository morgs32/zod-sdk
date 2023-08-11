![zod-sdk](./zod-sdk.png)

Zod SDK is an RPC library. Like TRPC it's going to reflect types from your backend. Of course, it does more than that. Here's what:

- [What and why](#what-and-why)
  - [Type narrowing your payloads](#type-narrowing-your-payloads)
    - [Asynchronous context tracking in Node](#asynchronous-context-tracking-in-node)
  - [Where does zod come in?](#where-does-zod-come-in)
- [Getting Started](#getting-started)
  - [On the server, make a router](#on-the-server-make-a-router)
  - [On the client, make a dispatcher](#on-the-client-make-a-dispatcher)
  - [useQuery in React](#usequery-in-react)
- [server](#server)
  - [server.makeService](#servermakeservice)
  - [server.makeRouter](#servermakerouter)
  - [server.makeQuery](#servermakequery)
- [client](#client)
  - [client.makeDispatcher](#clientmakedispatcher)
  - [client.query](#clientquery)
  - [client.command](#clientcommand)
- [FAQ](#faq)
- [To do](#to-do)

<br />

# What and why

## Type narrowing your payloads

If you used `prisma` then you probably have enjoyed getting back a payload with relationship data you specified in an `includes` property on your query. This allows you to do that, if you're up to the task of writing the more advanced return types on your backend functions. Here's an example:

```
async function find<T extends 'foo' | 'bar'>(
  str: T
): Promise<T extends 'foo' ? 'found-foo' : 'found-bar'> {
  return (str === 'foo' ? 'found-foo' : 'found-bar') as any
}

const query = makeQuery(find)

const result = client.query(query, (find) => find('foo'))
// Result has type: Promise<"found-foo">
```

See how that could be useful? A word of warning: this does necessarily put the onus on the backend to write complex Typescript and equally complex, typesafe, and well-tested code. With great power comes great responsibility I suppose.

### Asynchronous context tracking in Node

In order to achieve type narrowing, we had to leave your function "unadulterated". That might be a harsh word for how you must conform to the arguments provided to you in a [TRPC procedure](https://trpc.io/docs/quickstart#3-using-input-parser-to-validate-procedure-inputs):

```
// This is a TRPC snippet
userById: publicProcedure
  .input(z.string())
  .query(async ({ input, ctx }) => {
    const user = await db.user.findById(input);
    return user;
  })
```

You have to use TRPC's `input` and `ctx` properties. It all comes bundled in an `opts` argument. In doing so, TRPC can't pass around complex types, because in the source code they have to wrap them and unwrap/infer them again.

Zod SDK passes around the original function type, without alteration. But of course your backend may need data usually found in request headers or cookies, or you want to abstract some reusable code across many procedures. Here's how you do that:

```
// Make a service
const service = server.makeService({
  makeContext: () => ({
    foo: 'bar',
  }),
})

async function findContextFoo(): 'bar' {
  const { foo } = service.useCtx() // See this!?
  return foo
}
const routes = {
  findFooOrBar: service.makeQuery(findFooOrBar),
}
// ...and so on, see "Getting Started"
```

## Where does zod come in?

Like TRPC, you can use schemas to validate query and command parameters from the client, or the payloads sent back from the server.

```
const addYear = server.makeQuery(
  async function (date: Date) {
    return new Date(date.getFullYear() + 1, date.getMonth(), date.getDate())
  },
  {
    parameter: z.date(),
    payload: z.date(),
  }
)
```

There's a big benefit to doing this! We can use zod to parse input and results and therefore stay consistent with our types.

**Let's put that another way. If you want to use Date, Map, or Set objects, you have to use **`schemas`** in **`makeQuery`** or **`makeCommand`**.**

# Getting Started

```
pnpm add zod-sdk
```

## On the server, make a router

Use the `server` export on the Node server.
1. Pass your backend functions to `server.makeQuery()` or `server.makeCommand()`
2. Create a routes object
3. Pass routes to `server.makeRouter()`
4. Export `typeof routes` however you want.

```
// server.ts
import { server } from 'zod-sdk/server'

function findUserById(id: string) {
  const user = await db.user.findById(input);
  return user
}

const routes = {
  findUserById: server.makeQuery(findUserById),
}

const router = server.makeRouter(routes)

export type Routes = typeof routes
```

That `router` returned from `server.makeRouter()` is a request handler. You can use it directly or in NextJS you can do this:

```
export { GET, POST } from server.makeRouter(routes)
```

## On the client, make a dispatcher

Client-side:
1. Pass your routes type object to `client.makeDispatcher(options: Options)`
2. Pass the appropriate handler to `client.query()` or `client.mutate()`


```
import { client } from 'zod-sdk/client'

const sdk = client.makeDispatcher<Routes>({
  baseUrl: url,
})
const result = await client.query(sdk.findFooOrBar, (find) =>
  find('foo')
)
```

NOTE: The client does not necessarily have to be the browser by the way. The same methods are availble to you on the server:
```
import { server } from 'zod-sdk/server'

const sdk = server.makeDispatcher<Routes>({
  baseUrl: url,
})
```
## useQuery in React

This is a wrapper around Vercel's `swr` data fetching library. You probably know it or `@tanstack/react-query`.

You'll have to import this separately from `zod-sdk/client`. Because it only works client side.

```
'use client'

import styles from './page.module.css'
import { useQuery, client  } from 'zod-sdk/client'
import { IRoutes } from './routes'

const client = client.makeDispatcher<IRoutes>({
  baseUrl: 'http://localhost:3000/api/sdk',
})

export function Data() {
  const { data } = useQuery(client.queries.hello, {
    fn: (hello) => hello(),
  })

  return (
    <pre>
      <code className={styles.code}>{JSON.stringify(data, null, 2)}</code>
    </pre>
  )
}
```

# server

## server.makeService

This enables you to share `context` and `middleware` across procedures. Here's an example.

```
// Make a service
const service = server.makeService({
  makeContext: () => ({
    foo: 'bar',
  }),
  middleware: (req, next) => {
    // console.log(req.pathname)
    next()
  }
})
```

Then you call
- `service.makeQuery()` or `service.makeCommand()`
- Instead of  ~~server~~.makeQuery() or ~~server.makeCommand()~~

## server.makeRouter

Call this to make the router on the server. That's covered in [Getting Started](#getting-started)

## server.makeQuery

You should use `server/service.makeQuery()` to make a GET request. Whether you use `makeQuery` or `makeCommand` doesn't make a difference, but do what's intuitive! Read up on CQRS if you want some reasons why

# client

## client.makeDispatcher
See [Make a dispatcher](#on-the-client-make-a-dispatcher)

## client.query
See [Getting Started](#getting-started).

Calling `client.query` with a handler you created with `makeQuery` will throw a typescript error.
## client.command

Works just like `client.query` except you pass it command handlers. 

# FAQ

- Waiting on yours!

# To do
- [ ] More testing


