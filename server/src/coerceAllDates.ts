import z, {
  ZodArray,
  ZodDate,
  ZodObject,
  ZodOptional,
  ZodSchema,
  ZodTuple,
  ZodTypeAny,
  ZodUnion,
} from 'zod'

export function coerceAllDates(schema: ZodTypeAny): ZodTypeAny {
  if (schema instanceof ZodDate) {
    return z.coerce.date()
  }
  if (schema instanceof ZodTuple) {
    return z.tuple(schema.items.map((item: ZodSchema) => coerceAllDates(item)))
  }
  if (schema instanceof ZodObject) {
    const newObj: any = {}
    Object.keys(schema.shape).forEach((key) => {
      newObj[key as keyof typeof newObj] = coerceAllDates(
        schema.shape[key as keyof typeof schema.shape]
      )
    })
    return z.object(newObj)
  }
  if (schema instanceof ZodUnion) {
    // eslint-disable-next-line no-underscore-dangle
    return z.union(
      schema.options.map((option: ZodSchema) => coerceAllDates(option))
    )
  }
  if (schema instanceof ZodOptional) {
    // eslint-disable-next-line no-underscore-dangle
    return coerceAllDates(schema._def.innerType)
  }
  if (schema instanceof ZodArray) {
    return coerceAllDates(schema.element)
  }

  return schema
}
