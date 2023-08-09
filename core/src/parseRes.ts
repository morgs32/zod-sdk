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
  const data = (await res.json()) as any
  // TODO: Do something with include
  return data.result
}
