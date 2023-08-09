import z from 'zod'
import { ParserSelector } from '../types'

export const parseBoolean: ParserSelector<{ type: 'boolean' }> = () => {
  return z.boolean()
}
