import { JSONSchema7Definition } from 'json-schema';
import { ParserSelector } from '../types';
import { parseSchema } from './parseSchema';
import z from 'zod';

export const parseAnyOf: ParserSelector<{ anyOf: JSONSchema7Definition[] }> = (schema, refs) => {
  return schema.anyOf.length
    ? schema.anyOf.length === 1
      ? parseSchema(schema.anyOf[0], {
        ...refs,
        path: [...refs.path, 'anyOf', 0],
      })
      : z.union(schema.anyOf.map((schema, i) =>
        parseSchema(schema, { ...refs, path: [...refs.path, 'anyOf', i] })
      ) as any)
    : z.any()
};
