import { IncomingMessage } from 'http'
import getRawBody from 'raw-body'

export async function parseBody(
  req: IncomingMessage,
): Promise<any> {
  
  
  const length = req.headers['content-length']
  const encoding = 'utf-8' // contentType.parse(req).parameters.charset
  const limit = '1mb'

  const buffer = await getRawBody(req, {
    encoding, limit, length 
  })
    .catch((e) => {
      if (e.type === 'entity.too.large') {
        throw new Error(`Body exceeded ${limit} limit`)
      } else {
        throw new Error('Invalid body')
      }
    })

  const body = buffer.toString()

  return parseJson(body)

}

/**
 * Parse `JSON` and handles invalid `JSON` strings
 * @param str `JSON` string
 */
function parseJson(str: string): object {
  if (str.length === 0) {
    // special-case empty json body, as it's a common client-side mistake
    return {}
  }

  try {
    return JSON.parse(str)
  } catch (e) {
    throw new Error('Invalid JSON')
  }
}
