import { routes } from '@/app/routes'
import { server } from 'zod-sdk/server'

export const { GET } = server.makeRouter(routes)
