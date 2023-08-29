import { ZodType, z as _z } from 'zod'

export type IZod = Omit<typeof _z, 'any' | 'unknown'>

export function makeSchemas<T>(fn: (z: IZod) => ZodType<T>) {
  return fn
}
