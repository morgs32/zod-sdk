import z from 'zod'
import { ParserSelector } from '../types'
import { parseSchema } from './parseSchema'

export const parseArray: ParserSelector<{ type: 'array' }> = (schema, refs) => {
  if (Array.isArray(schema.items)) {
    return z.tuple(
      schema.items.map((v, i) =>
        parseSchema(v, { ...refs, path: [...refs.path, 'items', i] })
      ) as any
    )
  }
  let r = !schema.items
    ? z.array(z.any())
    : z.array(
        parseSchema(schema.items, {
          ...refs,
          path: [...refs.path, 'items'],
        })
      )
  if (typeof schema.minItems === 'number') r.min(schema.minItems)
  if (typeof schema.maxItems === 'number') r.max(schema.maxItems)
  return r
}
