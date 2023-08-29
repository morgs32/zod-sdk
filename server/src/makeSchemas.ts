import { ZodType, z as _z } from 'zod'

export function makeSchemas<T>(
  fn: (z: Omit<typeof _z, 'any' | 'unknown'>) => ZodType<T>
): ZodType<T> {
  _z.date = _z.coerce.date
  return fn(_z)
}
