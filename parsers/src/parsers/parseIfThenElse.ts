import { JSONSchema7Definition } from 'json-schema';
import { ParserSelector } from '../types';
import { parseSchema } from './parseSchema';
import z from 'zod';

export const parseIfThenElse: ParserSelector<{
  if: JSONSchema7Definition;
  then: JSONSchema7Definition;
  else: JSONSchema7Definition;
}> = (
  schema,
  refs
) => {
  const $if = parseSchema(schema.if, { ...refs, path: [...refs.path, 'if'] });
  const $then = parseSchema(schema.then, {
    ...refs,
    path: [...refs.path, 'then'],
  });
  const $else = parseSchema(schema.else, {
    ...refs,
    path: [...refs.path, 'else'],
  });
  return z.union([$then, $else]).superRefine((value, ctx) => {
    const result = $if.safeParse(value).success
      ? $then.safeParse(value)
      : $else.safeParse(value);
    if (!result.success) {
      result.error.errors.forEach((error) => ctx.addIssue(error))
    }
  })
};
