import { routes } from '@/app/routes'
import { createServerRouter } from 'cqrpc'

const router = createServerRouter(routes)

export async function GET(req: Request) {
  return router(req)
};
