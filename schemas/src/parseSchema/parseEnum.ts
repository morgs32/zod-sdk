import { JSONSchema7Type } from 'json-schema'
import { ParserSelector } from '../types'
import z, { Primitive } from 'zod'

export const parseEnum: ParserSelector<{ enum: JSONSchema7Type[] }> = (
  schema
) => {
  if (schema.enum.length === 0) {
    return z.never()
  } else if (schema.enum.length === 1) {
    // union does not work when there is only one element
    return z.literal(schema.enum[0] as Primitive)
  } else if (schema.enum.every((x) => typeof x === 'string')) {
    return z.enum(schema.enum.map((x) => x) as any)
  } else {
    return z.union(schema.enum.map((x) => z.literal(x as Primitive)) as any)
  }
}
