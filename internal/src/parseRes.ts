import { parseJsonSchema } from 'zod-sdk/schemas'
import { IResult } from 'zod-sdk/server'
export async function parseRes(res: Response) {
  if (!res.ok) {
    const message = await res.text().catch((e) => e.message)
    const url = new URL(res.url)
    if (res.status === 404) {
      throw new Error(
        `Check that there is an sdk route at ${
          url.origin + url.pathname.split('/').slice(0, -1).join('/')
        } \n${message}`
      )
    }
    throw new Error(`[${res.status}] at ${url.href} \n${message}`)
  }
  const data = await res.text().then((text) => {
    try {
      return JSON.parse(text) as IResult
    } catch (e) {
      throw new Error(`Invalid JSON at ${res.url}: \n${text}`)
    }
  })
  // TODO: Do something with include

  if (data.schema) {
    const parsed = parseJsonSchema(data.schema).safeParse(data.payload)
    if (!parsed.success) {
      throw new Error(
        `Invalid response at ${res.url}: \n${parsed.error.message}`
      )
    }
    return parsed.data
  }
  return data.payload
}
