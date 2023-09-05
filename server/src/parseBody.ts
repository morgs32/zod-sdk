import { IncomingMessage } from 'http'

export async function parseBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (text: string) => (data += text))
    req.on('end', () => {
      try {
        const json = JSON.parse(data)
        resolve(json)
      } catch (err) {
        reject(new Error('req.body was not JSON'))
      }
    })
  })
}
