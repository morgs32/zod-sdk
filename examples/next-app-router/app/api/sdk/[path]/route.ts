import { routes } from '@/app/routes'
import { server } from 'zod-sdk'

export const { GET } = server.makeRouter(routes)
