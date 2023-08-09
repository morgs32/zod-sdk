import { JSONSchema7 } from 'json-schema'
import { ParserSelector, Refs } from '../types'
import { omit } from '../utils/omit'
import { parseSchema } from './parseSchema'

/**
 * For compatibility with open api 3.0 nullable
 */
export const parseNullable: ParserSelector<{ nullable: true }> = (
  schema: JSONSchema7 & { nullable: true },
  refs: Refs
) => {
  return parseSchema(omit(schema, 'nullable'), refs).nullable()
}
