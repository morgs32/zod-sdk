import { JSONSchema7Definition } from 'json-schema'
import { ParserSelector } from '../types'
import { parseSchema } from './parseSchema'
import z from 'zod'

export const parseNot: ParserSelector<{ not: JSONSchema7Definition }> = (
  schema,
  refs
) => {
  return z.any().refine(
    (value) =>
      !parseSchema(schema.not, {
        ...refs,
        path: [...refs.path, 'not'],
      }).safeParse(value).success,
    'Invalid input: Should NOT be valid against schema'
  )
}
