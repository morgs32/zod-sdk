import { JSONSchema7 } from 'json-schema'
import z from 'zod'

export type ParserSelector<T extends {} = {}> = (
  schema: JSONSchema7 & T,
  refs: Refs
) => z.ZodType
export type ParserOverride = (
  schema: JSONSchema7,
  refs: Refs
) => z.ZodType | void

export type Options = {
  name?: string
  module?: boolean | 'cjs' | 'esm'
  withoutDefaults?: boolean
  overrideParser?: ParserOverride
  recursionDepth?: number
}

export type Refs = Options & {
  path: (string | number)[]
  seen: Map<object | boolean, { n: number; r: z.ZodType | undefined }>
}
