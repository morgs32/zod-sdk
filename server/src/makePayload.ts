import { z } from 'zod'

export const makePayload = <
  T extends (...args: any[]) => any,
  S extends z.ZodType<Awaited<ReturnType<T>>, any, any>,
>(
  _: T,
  schema: S
) => schema
