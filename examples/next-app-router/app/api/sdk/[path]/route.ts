import { routes } from '@/app/routes'
import { createServerRouter } from 'zod-sdk/server'

const router = createServerRouter(routes)

export async function GET(req: Request) {
  return router(req)
}
