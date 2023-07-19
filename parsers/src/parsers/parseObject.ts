import { ParserSelector } from '../types';
import { parseAnyOf } from './parseAnyOf';
import { its, parseSchema } from './parseSchema';
import { parseAllOf } from './parseAllOf';
import z from 'zod';

export const parseObject: ParserSelector<{ type: 'object' }> = (schema, refs) => {
  let zodSchema: z.ZodObject<any> | z.ZodRecord<any> | z.ZodAny;

  const additionalProperties =
    schema.additionalProperties !== undefined
      ? parseSchema(schema.additionalProperties, {
        ...refs,
        path: [...refs.path, 'additionalProperties'],
      })
      : undefined;
      
  if (schema.properties) {
    zodSchema = z.object(
      Object.fromEntries(
        Object.entries(schema.properties).map(([key, propSchema]) => {
          const hasDefault =
          (typeof propSchema === 'object' &&
            propSchema.default !== undefined) ||
          (typeof schema.default === 'object' &&
            schema.default !== null &&
            key in schema.default);

          const required = schema.required?.includes(key) ?? false;
          const optional = !hasDefault && !required;
          let result = parseSchema(propSchema, {
            ...refs,
            path: [...refs.path, 'properties', key],
          })
          result = optional ? result.optional() : result
          return [
            key,
            result,
          ];
        })
      )
    )

    if (additionalProperties) {
      zodSchema = zodSchema.catchall(additionalProperties)
    }
  }
  else if (additionalProperties) {
    zodSchema = z.record(additionalProperties)
  }
  else {
    zodSchema = z.any()
  }


  if (its.an.anyOf(schema)) {
    zodSchema.and(parseAnyOf(
      {
        ...schema,
        anyOf: schema.anyOf.map((x) =>
          typeof x === 'object' &&
          !x.type &&
          (x.properties || x.additionalProperties || x.patternProperties)
            ? { ...x, type: 'object' }
            : x
        ),
      },
      refs
    ))
  }

  if (its.an.allOf(schema)) {
    zodSchema.and(parseAllOf(
      {
        ...schema,
        allOf: schema.allOf.map((x) =>
          typeof x === 'object' &&
          !x.type &&
          (x.properties || x.additionalProperties || x.patternProperties)
            ? { ...x, type: 'object' }
            : x
        ),
      },
      refs
    ))
  }

  return zodSchema;
}
