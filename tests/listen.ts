import http from 'http'
import net from 'net'

const map = new Map<http.Server, string>()
export const listen = (
  srv: http.Server,
  hostname = 'localhost'
): Promise<string> =>
  new Promise((resolve, reject) => {
    srv.on('error', reject)
    srv.listen(() => {
      const { port } = srv.address() as net.AddressInfo
      resolve(`http://${hostname}:${port}`)
    })
  })

export async function makeServer(
  handler: http.RequestListener,
  cb: (url: string) => any
) {
  const srv = http.createServer(handler)
  const url = await listen(srv)
  map.set(srv, url)
  await cb(url)
  srv.close()
}
