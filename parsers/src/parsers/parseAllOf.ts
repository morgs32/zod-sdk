import { JSONSchema7Definition } from 'json-schema'
import { parseSchema } from './parseSchema'
import { half } from '../utils/half'
import { ParserSelector, Refs } from '../types'
import z from 'zod'

const originalIndex = Symbol('Original index')

const ensureOriginalIndex = (arr: JSONSchema7Definition[]) => {
  let newArr = []

  for (let i = 0; i < arr.length; i++) {
    const item = arr[i]
    if (typeof item === 'boolean') {
      newArr.push(
        item ? { [originalIndex]: i } : { [originalIndex]: i, not: {} }
      )
    } else if (originalIndex in item) {
      return arr
    } else {
      newArr.push({ ...item, [originalIndex]: i })
    }
  }

  return newArr
}

export const parseAllOf: ParserSelector<{ allOf: JSONSchema7Definition[] }> = (
  schema,
  refs: Refs
) => {
  if (schema.allOf.length === 0) {
    return z.never()
  } else if (schema.allOf.length === 1) {
    const item = schema.allOf[0]
    // typeof schema.allOf[0] === "boolean"
    //   ? schema.allOf[0]
    //     ? { [originalIndex]: 0 }
    //     : { [originalIndex]: 0, not: {} }
    //   : originalIndex in schema.allOf[0]
    //   ? schema.allOf[0]
    //   : { ...schema.allOf[0], [originalIndex]: 0 };

    return parseSchema(item, {
      ...refs,
      path: [...refs.path, 'allOf', (item as any)[originalIndex]],
    })
  } else {
    const [left, right] = half(ensureOriginalIndex(schema.allOf))

    return z.intersection(
      parseAllOf({ allOf: left }, refs),
      parseAllOf(
        {
          allOf: right,
        },
        refs
      )
    )
  }
}
