import z from 'zod'
import { ParserSelector } from '../types'

export const parseString: ParserSelector<{ type: 'string' }> = (schema) => {
  if (schema.format === 'date-time') return z.coerce.date()

  let r = z.string()
  if (schema.pattern) r.regex(new RegExp(schema.pattern))
  if (schema.format === 'email') r.email()
  else if (schema.format === 'uri') r.url()
  else if (schema.format === 'uuid') r.uuid()
  if (typeof schema.minLength === 'number') r.min(schema.minLength)
  if (typeof schema.maxLength === 'number') r.max(schema.maxLength)
  return r
}
