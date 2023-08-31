import z, { ZodArray, ZodObject, ZodTuple, ZodTypeAny, ZodUnion } from 'zod'

export function coerceAllDates(schema: ZodTypeAny): ZodTypeAny {
  switch (schema._def.typeName) {
    case 'ZodDate':
      return z.coerce.date()
    case 'ZodTuple':
      return z.tuple(
        (schema as ZodTuple).items.map((item: ZodTypeAny) =>
          coerceAllDates(item)
        ) as [ZodTypeAny, ...ZodTypeAny[]]
      )
    case 'ZodObject':
      const newObj: any = {}
      const zodObject = schema as ZodObject<any>
      Object.keys(zodObject.shape).forEach((key) => {
        newObj[key as keyof typeof newObj] = coerceAllDates(
          zodObject.shape[key as keyof typeof zodObject.shape]
        )
      })
      return z.object(newObj)
    case 'ZodUnion':
      // eslint-disable-next-line no-underscore-dangle
      return z.union(
        (schema as ZodUnion<any>).options.map((option: ZodTypeAny) =>
          coerceAllDates(option)
        )
      )
    case 'ZodOptional':
      // eslint-disable-next-line no-underscore-dangle
      return coerceAllDates(schema._def.innerType).optional()
    case 'ZodArray':
      return coerceAllDates((schema as ZodArray<any>).element)
  }
  return schema
}
